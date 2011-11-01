## WARNING!
This project is still in its early stages, therefor anything and everything can change at this time.

Wait for a first release before you use it somewhere.

## About
Check out the demo: http://nofish.eu/code/multiselect_search/

## Basic usage
`multiselect_search(multiselect, conf);`

* multiselect is the multiselect dom element to what you wish to add search to
* config is object with what you can cahnge the behavior of multiselect search
  * NOTE: config is optional.

## TODO
 * if input contains `optgroup`
 * method to get full list (e.g select all button)

## Workflow
With default config settings:

 * container div is created and children appended:
   * **search** - is text input where you can search for an option
   * **select** - a div representing the select tag inside what there is a div per every option. These are shown and hidden based on the searchterm
   * NOTE: **search** doesn't have a name therefor it is not posted with the form.
 * the container div is inserted into the dom tree after the original multiselect
 * the original mutliselect is hidden with CSS `display: none`
 * when clicking on an option div:
   * if the option was not selected class `selected` will be removed from the div and the option in original multiselect is marked as deselected
   * if the option was selected class `selected` will be added to the div and the option in original multiselect is marked as selected

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
     * params: searchterm, itemName
     * return value true if item should be shown; false if not
   * default value: case-insensitive regular expression
 * **onchange** - function that will be executed every time an option selected status is changed
   * type: function
   * default value: none
 * **inherit_size** - if set `true` original multiselect offset{Width,Height} will be set as duplicated multiselect width,height
   * type:  boolean
   * default value: true
 * **delay** - delay between last keyup and when search is executed
   * type: int
   * default: 200
 * **searchbox** - Dom element to what the search action will be attached to instead of creating a new input field
   * type: dom element
   * default: none
   * NOTE: if set will void config param `searchbox_class`
 * **select_class** - class name of the div containing the option divs
   * type: string
   * default value: mss
 * **option_class** - class for the option div
   * type: string
   * default value: mss_option
 * **selected_option_class** - added to option (div) when selected, removed when deselected
   * type: string
   * default value: selected
 * **changeState(to = true, [visibleOnly = false])** - change selected state of all options
   * type function
   * params:
     * **to** - if true options will be marked as selected, if false deselected
     * **visibleOnly** - if set true only the options that are visible will be changed

## return value
if given object is not multiselect then return value is `false`

otherwise return value is object with following keys:
 
 * **get_selected** - functions that returns selected options as objects in array, object keys are:
   * **text** - option name (option innerHTML)
   * **changeState** method to change selected status (true - select, false - deselect)
 * **get_selected_values** - (deprecated) functions that returns selected options names (option innerHTML) as array
 * **container_node** - dom element container div
 * **searchbox_node** - dom element searchbox
 * **select_node** - dom element div that represents the select tag (contains divs that represent option tags)
 * **search** - function - if you externally wish to execute search - function param is searchterm
 * **changeState** - function - changes selected status for all visible options
 * **showSelected** - filters the options so that only selected options are shown