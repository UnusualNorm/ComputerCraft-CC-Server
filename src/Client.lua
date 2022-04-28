Socket, SocketErr = http.websocket(connectionURL)
RemoteCallbacks = {}
RemoteCallbackNonces = {}

-- Make sure all nil values in a table is json_null
local function prepareTable(data)
	for i, value in ipairs(data) do
		if value == nil then
			data[i] = textutils.json_null
		end
	end

	return data
end

-- Make sure we are connected to server
local function connectToSocket()
	write('Connecting to ' .. connectionURL .. '... ')
	repeat
		Socket, SocketErr = http.websocket(connectionURL)
		if not Socket then
			printError(SocketErr)
		else
			print('Success.')
		end
	until Socket
end

local charset = {}

-- qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890
for i = 48, 57 do
	table.insert(charset, string.char(i))
end
for i = 65, 90 do
	table.insert(charset, string.char(i))
end
for i = 97, 122 do
	table.insert(charset, string.char(i))
end

-- Generate random string
local function random(length)
	math.randomseed(os.time())

	if length > 0 then
		return string.random(length - 1) .. charset[math.random(1, #charset)]
	else
		return ''
	end
end

-- Generate nonces
local function generateNonce(table)
	local randomStr = random(5)
	if RemoteCallbackNonces[randomStr] then
		return generateNonce(table)
	else
		return randomStr
	end
end

-- string.startsWith
local function startsWith(String, Start)
	return string.sub(String, 1, string.len(Start)) == Start
end

connectToSocket()

while true do
	-- websocket_message event data is:
	-- url, rawMessage, isBinary
	local eventData = { os.pullEventRaw() }
	local eventName = table.remove(eventData, 1)

	if eventName == 'websocket_closed' and eventData[1] == connectionURL then
		print('WebSocket closed...')
		connectToSocket()
	elseif eventName == 'websocket_message' and eventData[1] == connectionURL then
		local messageData = textutils.unserializeJSON(eventData[2])
		local nonce = table.unpack(messageData)

		if nonce and startsWith(nonce, '!') then
			-- Actions are create, delete, req, and res
			if nonce == '!callback' then
				local action = messageData[2]
				local cbId = messageData[3]

				if action == 'create' then
					local function callback(...)
						local cbNonce = generateNonce(RemoteCallbackNonces)
						local response = nil
						Socket.send(
							textutils.serialiseJSON({
								'!callback',
								'req',
								cbId,
								cbNonce,
								arg,
							})
						)
						local isResponse = false

						repeat
							-- TODO: Determine whether this discards non-matching events
							local rawMessage = Socket.recieve()
							local message =
								textutils.unserializeJSON(rawMessage)
							if message[0] == '!callback' and message[1] == 'res' then
								response = message[3]
								isResponse = message[2] == cbNonce
							elseif message[0] == '!callback' and message[1] == 'delete' then
								break
							end
						until isResponse

						if isResponse then
							return table.unpack(response)
						end
					end

					RemoteCallbacks[cbId] = callback
				elseif action == 'delete' then
				end
			end
			-- FIXME: If server disconnects during an operation, the client crashes...
		else
			local globalNames = {}
			setmetatable(globalNames, { __index = _G })
			local response = textutils.serialiseJSON({ messageData[1], false, 'ERR_UNKNOWN' })
			local fn, fnErr = load(messageData[2], nil, 't', globalNames)

			if fn then
				local rawOutput = { pcall(fn) }
				local success = table.remove(rawOutput, 1)
				local output = prepareTable(rawOutput)

				if success then
					response =
						textutils.serialiseJSON({ nonce, true, output })
				else
					local pcErr = output[1]
					response =
						textutils.serialiseJSON({
							nonce,
							false,
							{pcErr},
						})
				end
			else
				response =
					textutils.serialiseJSON({
						nonce,
						false,
						{fnErr},
					})
			end
			Socket.send(response)
		end
	elseif eventName ~= 'websocket_failure' and eventName ~= 'websocket_success' then
		if eventName == nil then
			eventName = textutils.json_null
		end
		local output = prepareTable(eventData)

		Socket.send(
			textutils.serialiseJSON({
				'!event',
				eventName,
				table.unpack(output),
			})
		)
	end
end