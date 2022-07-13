_G.CollectEvents = true
_G.Callbacks = {}
_G.RemoteCallbacks = {}
_G.RemoteCallbackNonces = {}
_G.EventQueue = {}

-------------------
---- Utilities ----
-------------------

_G.Charset = {}
-- This is just a shorthand to generate the following characters:
-- qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890
for i = 48, 57 do
	table.insert(_G.Charset, string.char(i))
end
for i = 65, 90 do
	table.insert(_G.Charset, string.char(i))
end
for i = 97, 122 do
	table.insert(_G.Charset, string.char(i))
end

function string.starts(String, Start)
	return string.sub(String, 1, string.len(Start)) == Start
end

function string.random(Length, Charset)
	if not Charset then
		Charset = _G.Charset
	end

	if Length > 0 then
		return string.random(Length - 1) .. Charset[math.random(1, #Charset)]
	else
		return ''
	end
end

function table.length(Table)
	local count = 0
	for _ in pairs(Table) do
		count = count + 1
	end
	return count
end

function table.unique(Table, Length, Charset)
	if not Length then
		Length = 1
	end
	if not Charset then
		Charset = _G.Charset
	end

	local maxLength = table.length(Charset) ^ Length
	if table.length(Table) >= maxLength then
		return table.unique(Table, Length + 1, Charset)
	end

	-- FIXME: Stop using random functions to generate unique IDs.
	local randomString = string.random(Length)
	if Table[randomString] then
		return table.unique(Table, Length, Charset)
	else
		return randomString
	end
end

-- This will take a table (array) and an item, it will remove the item from the table.
function table.removeItem(Table, Item)
	for i, v in ipairs(Table) do
		if v == Item then
			table.remove(Table, i)
			return true
		end
	end
	return false
end

function _G.RemoteCallback(Id)
	return function(...)
		-- We wrap the arguments in a table so that we can pass them as an array.
		local arg = { table.unpack(arg) }
		local nonce = table.unique(_G.RemoteCallbackNonces)
		table.insert(_G.RemoteCallbackNonces, nonce)

		local requestArg, requestMask = _G.PackTable(arg)
		Socket.send(
			textutils.serialiseJSON({
				'callback',
				'req',
				nonce,
				Id,
				requestArg,
				requestMask,
			})
		)

		_G.CollectEvents = false
		local responded = false
		local response = {}
		repeat
			-- We need to pull any event here, or else they will be lost since we stopped collecting events.
			local rawEvent = { os.pullEvent() }
			local event, _, rawMessage = table.unpack(rawEvent)
			if event == 'websocket_message' then
				local eventType, subcommand, reqNonce, data, dataMask =
					table.unpack(textutils.unserializeJSON(rawMessage))

				if eventType == 'callback' and subcommand == 'res' and reqNonce == nonce then
					response = _G.UnpackTable(data, dataMask)
					table.removeItem(_G.RemoteCallbackNonces, nonce)
					responded = true
				else
					table.insert(_G.EventQueue, rawEvent)
				end
			else
				table.insert(_G.EventQueue, rawEvent)
			end
		until responded

		_G.CollectEvents = true
		os.queueEvent('eventcollector_resume')
		return table.unpack(response)
	end
end

function _G.PackTable(Table)
	local data = {}
	local mask = {}

	for i, value in pairs(Table) do
		if value == nil then
			data[i] = textutils.json_null
			mask[i] = false
		elseif type(value) == 'table' then
			local tableData, tableMask = _G.PackTable(value)
			data[i] = tableData
			mask[i] = tableMask
		elseif type(value) == 'function' then
			local cbId = table.unique(_G.Callbacks)
			_G.Callbacks[cbId] = value
			
			data[i] = cbId
			mask[i] = true
			_G.Socket.send(
				textutils.serialiseJSON({
					'callback',
					'create',
					textutils.json_null,
					cbId,
				})
			)
		else
			data[i] = value
			mask[i] = false
		end
	end

	return data, mask
end

function _G.UnpackTable(Table, Mask)
	local data = {}
	
	for i, value in pairs(Table) do
		if value == textutils.json_null then
			data[i] = nil
		elseif type(value) == 'table' then
			data[i] = _G.UnpackTable(value, Mask[i])
		elseif type(value) == 'string' and Mask[i] then
			data[i] = _G.RemoteCallback(value)
		else
			data[i] = value
		end
	end
	
	return data
end

function _G.Eval(Code, Arg, Mask)
	local globalNames = {}
	setmetatable(globalNames, { __index = _G })
	local fn, fnErr = load(Code, nil, 't', globalNames)

	if fn then
		local pcallArg = _G.UnpackTable(Arg, Mask)
		local rawOutput = { pcall(fn(), table.unpack(pcallArg)) }
		local success = table.remove(rawOutput, 1)
		local output, outputMask = _G.PackTable(rawOutput)

		if success then
			return true, output, outputMask
		else
			local pcallErr = rawOutput[1]
			printError(pcallErr)
			return false, { pcallErr }
		end
	else
		printError(fnErr)
		return false, { fnErr }
	end
end

function _G.EventCollector()
	while true do
		if _G.CollectEvents then
			local event = { os.pullEvent() }
			if not _G.CollectEvents then
				os.queueEvent(table.unpack(event))
			else
				table.insert(EventQueue, event)
			end
		else
			os.pullEvent('eventcollector_resume')
		end
	end
end

--------------------
---- Networking ----
--------------------

-- Make sure we are connected to server, we just output it like this for consistency
while true do
	-- We do not need to worry about defining _G.ConnectionURL.
	-- It is defined when client requests the file.
	write('Connecting to ws://' .. _G.ConnectionURL .. '... ')
	_G.Socket, _G.SocketErr = http.websocket(_G.ConnectionURL)
	if not _G.Socket then
		print('Failed.')
		sleep(1)
	else
		print('Success.')
		break
	end
end

-- The main logic loop
while true do
	local event
	if _G.EventQueue[1] then
		event = table.remove(_G.EventQueue, 1)
	else
		event = { os.pullEvent() }
	end
	local eventName = table.remove(event, 1)

	if eventName == 'websocket_message' then
		local _, rawMessage = table.unpack(event)
		local message = textutils.unserializeJSON(rawMessage)
		local requestType = table.remove(message, 1)

		if requestType == 'eval' then
			parallel.waitForAny(function()
				local nonce, code, arg, mask = table.unpack(message)
				local success, output, outputMask = _G.Eval(code, arg, mask)
				_G.Socket.send(
					textutils.serialiseJSON({
						'eval',
						nonce,
						success,
						output,
						outputMask,
					})
				)
			end, _G.EventCollector)
		end

		if requestType == 'callback' then
			local subcommand = table.remove(message, 1)
			if subcommand == 'create' then
				local nonce, id = table.unpack(message)
				_G.RemoteCallbacks[id] = _G.RemoteCallback(id)
				_G.Socket.send(
					textutils.serialiseJSON({ 'callback', 'res', nonce })
				)
			elseif subcommand == 'req' then
				local nonce, id, arg, mask = table.unpack(message)
				local callback = _G.Callbacks[id]
				if callback then
					local callbackArg = _G.UnpackTable(arg, mask)
					local rawOutput = { callback(table.unpack(callbackArg)) }
					local output, outputMask = _G.PackTable(rawOutput)
					_G.Socket.send(
						textutils.serialiseJSON({
							'callback',
							'res',
							nonce,
							output,
							outputMask,
						})
					)
				end
			end
		end
	else
		local output, outputMask = _G.PackTable(event)
		_G.Socket.send(
			textutils.serialiseJSON({ 'event', eventName, output, outputMask })
		)
	end
end