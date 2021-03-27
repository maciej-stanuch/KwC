# KwC

### TLS Metrics to consider
* Self-issued = BAD
* Short public key? = BAD
* Forced old TLS version (Less than 1.1) - TODO
* Old TLS version without forcing = ULTRA BAD
* Expired certificate
* Name mismatch error
* SSL certificate revoked error - TODO


### Things to do
* Also check SSH and mail ports

### Useful links
* https://nodejs.org/api/tls.html#tls_tlssocket_getpeercertificate_detailed
* https://www.feistyduck.com/library/openssl-cookbook/online/ch-testing-with-openssl.html
* https://www.hardenize.com/report/moja.pg.edu.pl/1615494065#www_certs

