print('Connecting to ' .. connectionURL)
local socket, err = http.websocket(connectionURL)
local function connectToSocket()
    repeat
        socket, err = http.websocket(connectionURL)
        if not socket then
            printError(err)
        else
            print('WebSocket opened')
        end
    until socket
end

if not socket then
    connectToSocket()
else
    print('WebSocket opened')
end

while true do
    local type, url, rawMessage, isBinary = os.pullEvent()

    if type == "websocket_closed" and url == connectionURL then
        print('WebSocket closed')
        connectToSocket()
    elseif type == "websocket_message" and url == connectionURL then
        print('Command: ' .. rawMessage)
        local data = textutils.unserializeJSON(rawMessage)

        local response = nil
        local fn, err = load(data[2])
        if fn then
            local success, a, b = pcall(fn)
            if success then
                if a == nil then
                    a = textutils.json_null
                end
                response = textutils.serialiseJSON({ data[1], a, b })
            else
                response = textutils.serialiseJSON({ data[1], textutils.json_null, a })
            end
        else
            response = textutils.serialiseJSON({ data[1], textutils.json_null, err })
        end
        -- FIXME: If server disconnects during an operation, the client crashes...
        print('Response: ' .. response)
        socket.send(response)
    end
end
