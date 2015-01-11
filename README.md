# Important notes
ElastiCache cannot be accessed outside of the EC2 network. This makes sense, as the latency you'd get would mean you get little to no benefit of having caching.

# ElastiCache Memcached wrapper (memcached)
The project implements an auto-discovery of Memcached nodes in AWS through the lib/memcached.js wrapper.
It automatically detects when there are new nodes added to ElastiCache through the console and adds them to the connection lists without having to restart the node app.
