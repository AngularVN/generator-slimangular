###
common Filter
###

angular.module("<%= baseName %>.filters", []).filter("unsafe", [
  "$sce"
  ($sce) ->
    return (val) ->
      $sce.trustAsHtml val
]).filter("getAvatar", ->
  (a) ->
    a = "img/avatar.jpg"  unless a
    a
).filter("age", ->
  (arg) ->
    today = undefined
    if parseInt(arg)
      today = new Date()
      return parseInt(today.getFullYear() - parseInt(arg))
    arg
).filter("fixbr", ->
  (arg) ->
    arg.replace /&lt;br(.*?)\/&gt;/g, "<br />"  if arg
).filter("characters", ->
  (input, chars, breakOnWord) ->
    lastspace = undefined
    return input  if isNaN(chars)
    return ""  if chars <= 0
    if input and input.length >= chars
      input = input.substring(0, chars)
      unless breakOnWord
        lastspace = input.lastIndexOf(" ")
        input = input.substr(0, lastspace)  if lastspace isnt -1
      else
        input = input.substr(0, input.length - 1)  while input.charAt(input.length - 1) is " "
      return input + "..."
    input
).filter("words", ->
  (input, words) ->
    inputWords = undefined
    return input  if isNaN(words)
    return ""  if words <= 0
    if input
      inputWords = input.split(/\s+/)
      input = inputWords.slice(0, words).join(" ") + "..."  if inputWords.length > words
    input
).filter "timeago", ->
  (time, local, raw) ->
    DAY = undefined
    DECADE = undefined
    HOUR = undefined
    MINUTE = undefined
    MONTH = undefined
    WEEK = undefined
    YEAR = undefined
    offset = undefined
    span = undefined
    return "never"  unless time
    local = Date.now()  unless local
    if angular.isDate(time)
      time = time.getTime()
    else
      time = new Date(time).getTime()  if typeof time is "string"
    if angular.isDate(local)
      local = local.getTime()
    else
      local = new Date(local).getTime()  if typeof local is "string"
    return  if typeof time isnt "number" or typeof local isnt "number"
    offset = Math.abs((local - time) / 1000)
    span = []
    MINUTE = 60
    HOUR = 3600
    DAY = 86400
    WEEK = 604800
    MONTH = 2629744
    YEAR = 31556926
    DECADE = 315569260
    if offset <= MINUTE
      span = [
        ""
        (if raw then "now" else "less than a minute")
      ]
    else if offset < (MINUTE * 60)
      span = [
        Math.round(Math.abs(offset / MINUTE))
        "min"
      ]
    else if offset < (HOUR * 24)
      span = [
        Math.round(Math.abs(offset / HOUR))
        "hr"
      ]
    else if offset < (DAY * 7)
      span = [
        Math.round(Math.abs(offset / DAY))
        "day"
      ]
    else if offset < (WEEK * 52)
      span = [
        Math.round(Math.abs(offset / WEEK))
        "week"
      ]
    else if offset < (YEAR * 10)
      span = [
        Math.round(Math.abs(offset / YEAR))
        "year"
      ]
    else if offset < (DECADE * 100)
      span = [
        Math.round(Math.abs(offset / DECADE))
        "decade"
      ]
    else
      span = [
        ""
        "a long time"
      ]
    span[1] += ((if span[0] is 0 or span[0] > 1 then "s" else ""))
    span = span.join(" ")
    return span  if raw is true
    if time <= local
      span + " ago"
    else
      "in " + span

