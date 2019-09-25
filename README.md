# soundcloud-sync


## setup
install ruB

setup nginx to forward default port 9292

`gem install bundler`

`cd site` 

```
sudo apt-get install build-essential 
```


```
sudo apt-get install ruby-dev
sudo apt-get install ruby2.0-dev
sudo apt-get install ruby2.2-dev
sudo apt-get install ruby2.3-dev
```


`bundle install`
`./start.sh`



## todo

- rewrite metadata + playlist load to abuse the widget
- remove sc api cause it's so useless it is laughable 
- fix metadata errors causing concurrent renderQueue calls
- sync to timecode on load
- youtube integration
- spotify integration (needs authentication so like a db probably and a more legit webserver)
- scrubbing and timecode sync
- prettyfy
- discord integration
