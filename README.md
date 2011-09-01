## About
Check out the demo: http://nofish.eu/code/multiselect_search/

## Basic usage
`multiselect_search(multiselect, conf);`

* multiselect is the multiselect dom element to what you wish to add search to
* config is object with what you can cahnge the behavior of multiselect search
  * NOTE: config is optional.

## Workflow
With default config settings:

 * container div is created and children appended:
   * **search** - is text input where you can search for an option
   * **select** - is a duplicated multiselect where options are added/removed based on the search value
   * NOTE: neither **search** or **select** have a name therefor they are not posted with the form.
 * the container div is inserted into the dom tree after the original multiselect
 * the original mutliselect is hidden with CSS `display: none`
 * when selecting/deselecting option in the duplicated multiselect the option selected status is changed in the original multiselect too.

## Config
NOTE: Any and all config parameters are optional!

 * **searchbox_class** - class name for the input where you search
   * type: string
   * default value: none 
 * **container_id** -  id for the div containing the select and the searchbox
   * type: string
   * default value: none 
 * **container_class** - class name for the div containing the select and the searchbox
   * type: string
   * default value: none 
 * **match** - function that checks if item name matches searchterm
   * type: function
   * default value: case-insensitive regular expression
 * **onchange** - function that will be executed every time `change` event is triggered for select element
   * type: function
   * default value: none
 * **inherit_size** - if set `true` original multiselect offset{Width,Height} will be set as duplicated multiselect width,height
   * type:  boolean
   * default value: true
 * **searchbox** - Dom element to what the search action will be attached to instead of creating a new input field
   * type: dom element
   * default: none
   * NOTE: if set will void config param `searchbox_class`  

## return value
if given object is not multiselect then return value is `false`

otherwise return value is object with follwing keys:
 
 * **get_selected_values** - functions that returns selected options names (option innerHTML) as array
 * **container_node** - dom element container div
 * **searchbox_node** - dom element searchbox
 * **select_node** - dom element multiselect (the duplicated one that search changes)
 * **search** - function - if you externaly wish to execute search - function param is searchterm 
