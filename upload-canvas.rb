#!/usr/bin/env ruby

require 'bundler'
Bundler.setup

require 'faraday'
require 'openssl'
require 'json'

canvas_name = ARGV.first
canvas_file = "demo-canvases/#{canvas_name}.json"
abort "No canvas named '#{canvas_name}'" unless File.exists?(canvas_file)
canvas_content = File.read(canvas_file)

# Validate the JSON
JSON.parse(canvas_content)

conn = Faraday.new({:ssl => {:verify_mode => OpenSSL::SSL::VERIFY_NONE}}) do |builder|
  builder.request :url_encoded
  builder.adapter :net_http
end
conn.basic_auth ENV['ECHO_KEY'], ENV['ECHO_SECRET']
res = conn.post do |req|
  req.url 'https://api.echoenabled.com/v1/kvs/put'
  req.body = {'key' => canvas_name, 'value' => canvas_content, 'public' => true}
end

if res.success?
  puts "Canvas publish complete: #{res.body}"
else
  puts "Failed to publish canvas: #{res.status} #{res.body}"
  exit 1
end
