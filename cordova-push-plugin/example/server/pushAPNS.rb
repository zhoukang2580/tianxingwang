require 'rubygems'
require 'pushmeup'


APNS.host ='gateway.sandbox.push.apple.com' #'gateway.sandbox.push.apple.com' 
APNS.port = 2195 
APNS.pem  = '/Users/dongmeizaixian/Downloads/fengyiwoccscert.pem'
APNS.pass = ''

device_token = '4b1d605842676725ad9b938f070978fa206448af407f6a1a29d57f66430edfc4'
# APNS.send_notification(device_token, 'Hello iPhone!' )
APNS.send_notification(device_token, :alert => 'PushPlugin works!!', :badge => 1, :sound => 'beep.wav')
