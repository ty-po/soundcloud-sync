require_relative './app'

#use Rack::Static, :urls => ["/css", "/js"], :root => 'public', :index => 'index.html'

run App
