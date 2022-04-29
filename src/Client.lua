_G.Socket, SocketErr = http.websocket('ws://' .. ConnectionURL)
_G.Callbacks = {}
_G.RemoteCallbacks = {}
_G.RemoteCallbackNonces = {}
_G.EventQueue = {}

-- Make sure we are connected to server
local function connectToSocket()
	repeat
		write('Connecting to ' .. ConnectionURL .. '... ')
		Socket, SocketErr = http.websocket(ConnectionURL)
		if not Socket then
			print('Failed.')
		else
			print('Success.')
		end
	until Socket
end
connectToSocket()

local nonceCharset = {}
-- qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890
for i = 48, 57 do
	table.insert(nonceCharset, string.char(i))
end
for i = 65, 90 do
	table.insert(nonceCharset, string.char(i))
end
for i = 97, 122 do
	table.insert(nonceCharset, string.char(i))
end

-- Generate random string
local function random(length)
	math.randomseed(os.time())

	if length > 0 then
		return random(length - 1) .. nonceCharset[math.random(1, #nonceCharset)]
	else
		return ''
	end
end

-- Get table length
local function tableLength(T)
	local count = 0
	for _ in pairs(T) do
		count = count + 1
	end
	return count
end

-- Generate nonces
local function generateNonce(table, minLength)
	if not minLength then
		minLength = 1
	end

	local maxLength = tableLength(nonceCharset) ^ minLength
	if tableLength(table) >= maxLength then
		return generateNonce(table, minLength + 1)
	end

	local randomStr = random(minLength)
	if table[randomStr] then
		return generateNonce(table, minLength)
	else
		return randomStr
	end
end

-- Make sure all nil values in a table is json_null
local function prepareTable(data)
	if not data then
		return {}
	end

	for i, value in ipairs(data) do
		if value == nil then
			data[i] = textutils.json_null
		elseif type(value) == 'table' then
			data[i] = prepareTable(value)
		elseif type(value) == 'function' then
			local cbId = generateNonce(Callbacks)
			Callbacks[cbId] = function(...)
				return value(table.unpack(arg))
			end
			data[i] = cbId
			Socket.send(
				textutils.serialiseJSON({
					'!callback',
					'create',
					textutils.json_null,
					cbId,
				})
			)
		end
	end

	return data
end

-- Check if string starts another
local function startsWith(String, Start)
	return string.sub(String, 1, string.len(Start)) == Start
end

-- Create a callback
local function createCallback(cbId)
	local function callback(...)
		local cbNonce = generateNonce(RemoteCallbackNonces)
		local response = {}
		local arrayofargs = { table.unpack(arg) }

		Socket.send(
			textutils.serialiseJSON({
				'!callback',
				'req',
				cbNonce,
				cbId,
				prepareTable(arrayofargs),
			})
		)
		local isResponse = false

		repeat
			local rawEvent = { os.pullEvent() }
			local event, url, rawMessage = table.unpack(rawEvent)
			if event == 'websocket_message' then
				if url == ConnectionURL then
					local message = textutils.unserializeJSON(rawMessage)
					if message[1] == '!callback' and message[2] == 'res' and message[3] == cbNonce then
						response = message[4]
						isResponse = true
					elseif message[1] == '!callback' and message[2] == 'delete' and message[3] == cbNonce then
						break
					else
						table.insert(EventQueue, rawEvent)
					end
				end
			else
				table.insert(EventQueue, rawEvent)
			end
		until isResponse

		if isResponse then
			return table.unpack(response)
		end
	end

	RemoteCallbacks[cbId] = callback
end

while true do
	-- websocket_message event data is:
	-- url, rawMessage, isBinary
	local event
	if tableLength(EventQueue) > 0 then
		event = EventQueue[1]
		table.remove(EventQueue, 1)
	else
		event = { os.pullEvent() }
	end
	local eventName = table.remove(event, 1)

	if eventName == 'websocket_closed' and event[1] == ConnectionURL then
		print('WebSocket closed...')
		connectToSocket()
	elseif eventName == 'websocket_message' and event[1] == ConnectionURL then
		local message = textutils.unserializeJSON(event[2])
		local nonce = message[1]

		if nonce and startsWith(nonce, '!') then
			-- Actions are create, delete, req, and res
			if nonce == '!callback' then
				local action = message[2]
				local cbNonce = message[3]
				local cbId = message[4]

				if action == 'create' then
					createCallback(cbId)
					Socket.send(textutils.serialiseJSON({ cbNonce }))
				elseif action == 'delete' then
					RemoteCallbacks[cbId] = nil
				elseif action == 'req' then
					local arg = message[5]
					Socket.send(
						textutils.serialiseJSON({
							cbNonce,
							Callbacks[cbId](table.unpack(arg)),
						})
					)
				end
			end
			-- FIXME: If server disconnects during an operation, the client crashes...
		else
			local globalNames = {}
			setmetatable(globalNames, { __index = _G })
			local response =
				textutils.serialiseJSON({ message[1], false, 'ERR_UNKNOWN' })
			local fn, fnErr = load(message[2], nil, 't', globalNames)

			if fn then
				local rawOutput = { pcall(fn) }
				local success = table.remove(rawOutput, 1)
				local output = prepareTable(rawOutput)

				if success then
					response = textutils.serialiseJSON({ nonce, true, output })
				else
					local pcErr = output[1]
					response =
						textutils.serialiseJSON({ nonce, false, { pcErr } })
				end
			else
				response = textutils.serialiseJSON({ nonce, false, { fnErr } })
			end
			Socket.send(response)
		end
	elseif eventName ~= 'websocket_failure' and eventName ~= 'websocket_success' then
		if eventName == nil then
			eventName = textutils.json_null
		end
		local output = prepareTable(event)

		Socket.send(textutils.serialiseJSON({ '!event', eventName, output }))
	end
end