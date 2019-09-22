# app.rb
require 'rack'
require 'faye/websocket'
require 'json'

def getFile(path)
  return File.read("./public#{path}")
end

class App

  def initialize
    @sockets = Set.new
    @queue = []
  end

  def call(env)
    req = Rack::Request.new(env)
    print "#{req.ip}\t#{req.request_method}\t#{req.path_info}"
    if Faye::WebSocket.websocket?(env)
      puts "\t\tws"
      ws = Faye::WebSocket.new(env, nil, :ping => 30)

      @sockets.add(ws)

      ws.on :onopen do |event|
        puts "socket\tconnected"
      end

      ws.on :message do |event|
        puts "socket\tmessage\t#{event.data}"

        data = JSON.parse(event.data)

        case data["type"]
        when "open"
          data["data"] = @queue
          data["type"] = "queue"
        when "enqueue"
          if data["data"] != "" #can dedupe here if we want eventually
            @queue.push(data["data"])
          end
          data["data"] = @queue
          data["type"] = "queue"
        when "clear"
          @queue = []
          data["data"] = @queue
          data["type"] = "queue"
          data["queueIndex"] = -1
        when "shuffle"
          @queue = @queue.shuffle
          data["data"] = @queue
          data["type"] = "queue"
          data["queueIndex"] = -1
        end

        serialized = data.to_json()

        puts serialized

        if data["broadcast"]
          @sockets.each { |wss| wss.send(serialized) }
        else
          ws.send(serialized)
        end
      end

      ws.on :close do |event|
        puts "socket\tclose\t#{event.code}\t#{event.reason}"
        ws = nil
        @sockets.delete(ws)
      end
      # Return async Rack response
      ws.rack_response

    else
      puts "\tstatic"
      case req.path_info
      when '/', '/index.html'
        [ 200, { "Content-Type" => "text/html" }, [ getFile('/index.html') ] ]

      when '/js/sc.js'
        [ 200, { "Content-Type" => "text/javascript" }, [ getFile('/js/sc.js') ] ]

      when '/js/ws.js'
        [ 200, { "Content-Type" => "text/javascript" }, [ getFile('/js/ws.js') ] ]

      when '/js/mk.js'
        [ 200, { "Content-Type" => "text/javascript" }, [ getFile('/js/mk.js') ] ]

      when '/css/style.css'
        [ 200, { "Content-Type" => "text/css" }, [ getFile('/css/style.css') ] ]

      when '/silence.mp3'
        [ 200, { "Content-Type" => "audio/mp3" }, [ getFile('/silence.mp3') ] ]

      else
        [ 404, { "Content-Type" => "text/html" }, [ 'Nah Brah' ] ]

      end
    end
  end
end
