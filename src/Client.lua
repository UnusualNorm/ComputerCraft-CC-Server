print('Connecting to ' .. connectionURL)
Socket, err = http.websocket(connectionURL)
local function connectToSocket()
    --repeat
    --    Socket, err = http.websocket(connectionURL)
    --    if not Socket then
    --        printError(err)
    --    else
    --        print('WebSocket opened')
    --    end
    --until Socket
end

if not Socket then
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
        local data = textutils.unserializeJSON(rawMessage)
        local names = {}; setmetatable(names, {__index = _G})

        local response = nil
        local fn, err = load(data[2],nil,'t',names)
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
        print(response)
        Socket.send(response)
    end
end
