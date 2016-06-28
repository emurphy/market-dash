# Market Valuation Dashboard

Migrating from: https://github.com/emurphy/fred-dash

## Deployment notes

One-time setup of port 80 redirect to 3000 (see http://serverfault.com/questions/112795/how-can-i-run-a-server-on-linux-on-port-80-as-a-normal-user)
> sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000

Run meteor
> cd /data/market-dash
> meteor run >> meteor.log 2>&1 &

Update S&P 500 market price and latest PE10 ratio (not yet migrated to this repo)
> cd /data/fred-dash
> ./update_shiller_data.sh