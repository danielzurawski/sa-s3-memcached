# Important notes
1) ElastiCache cannot be accessed outside of the EC2 network, unless you setup port forwarding on your machine

# ElastiCache Memcached wrapper (memcached)
The project implements an auto-discovery of Memcached nodes in AWS through the lib/memcached.js wrapper.
It automatically detects when there are new nodes added to ElastiCache through the console and adds them to the connection lists without having to restart the node app.
