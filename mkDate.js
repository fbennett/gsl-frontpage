
console.log("Converting: "+process.argv[2])

var str = process.argv[2]

var m = str.match(/([0-9]{4})-([0-9]{2})-([0-9]{2})/)

if (m) {
  year = parseInt(m[1], 10);
  month = (parseInt(m[2], 10)-1);
  day = parseInt(m[3], 10);
}

d = Date.UTC(year, month, day)

console.log("utc date? " + (d/1000))