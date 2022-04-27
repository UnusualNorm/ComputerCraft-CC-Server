Socket, SocketErr = http.websocket(connectionURL)

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
        local globalNames = {}
        setmetatable(globalNames, { __index = _G })

        local response = textutils.serialiseJSON({messageData[1]})
        local fn, fnErr = load(messageData[2], nil, 't', globalNames)
        if fn then
            local rawOutput = { pcall(fn) }
            local success = table.remove(rawOutput, 1)
            local output = prepareTable(rawOutput)

            if success then
                response = textutils.serialiseJSON({ messageData[1], table.unpack(output) })
            else
                response = textutils.serialiseJSON({ messageData[1], textutils.json_null, output[1] })
            end
        else
            response = textutils.serialiseJSON({ messageData[1], textutils.json_null, fnErr })
        end
        -- FIXME: If server disconnects during an operation, the client crashes...
        print(response)
        Socket.send(response)
    elseif eventName ~= 'websocket_failure' and eventName ~= 'websocket_success' then
        if eventName == nil then
            eventName = textutils.json_null
        end
        local output = prepareTable(eventData)

        Socket.send(textutils.serialiseJSON({ '!event', eventName, table.unpack(output) }))
    end
end
