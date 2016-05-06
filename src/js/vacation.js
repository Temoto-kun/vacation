/**
 * @author Temoto-kun <kiiroifuriku@hotmail.com>
 */

(function vacation(undefined){
    var _options, $this, $instance, _dateToday, _events;

    /**
     * Initializes the vacation options.
     *
     * @param options A given options object
     */
    function initOptions(options){
        _options = options || {};
        _options.monthNames = _options.monthNames || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        _options.dayNames = _options.dayNames || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        _options.startDate = _options.startDate || moment(new Date()).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate();
        _options.range = _options.range || 7;
        _options.endDate = _options.endDate || moment(_options.startDate).add(_options.range, 'days').toDate();
        _options.viewDate = _options.viewDate || _options.startDate;
    }

    /**
     * Constructs the calendar header's template.
     *
     * @returns jQuery The jQuery object for the calendar header.
     */
    function constructCalendarHeader(){
        var $header, $row, $prev, $name, $next;

        $header = $('<div>').addClass('calendar__header');
        $row = $('<div>').addClass('calendar__row');
        $prev = $('<a>').addClass('header__month-select').text('<').attr('href', '#');
        $name = $('<div>').addClass('header__month-name').text(_options.monthNames[_options.viewDate.getMonth()] + ' ' + _options.viewDate.getFullYear());
        $next = $('<a>').addClass('header__month-select').text('>').attr('href', '#');

        $header.append($row);
        $row
            .append($prev)
            .append($name)
            .append($next);

        return $header;
    }

    /**
     * Function to determine if year is leap year.
     *
     * @param year The full year value.
     * @returns boolean Value indicating if year is a leap year.
     */
    function isLeapYear(year){
        if (year % 4 === 0){
            if (year % 100 === 0){
                return (year % 400 === 0);
            }
            return true;
        }
    }

    /**
     * Function to get the number of days in a month.
     * @param date A Date object.
     * @returns Number Number of days in the month of the Date object.
     */
    function getMaxDays(date){
        var month, year;

        month = date.getMonth();
        year = date.getFullYear();

        // Note: Months are zero-indexed (because real programmers count starting at zero)
        switch (month){
            case 0:
            case 2:
            case 4:
            case 6:
            case 7:
            case 9:
            case 11:
                return 31;
            case 1:
                return (isLeapYear(year) ? 29 : 28);
            default:
                break;
        }

        return 30;
    }

    /**
     * Constructs the template of the row where week names are put.
     *
     * @returns jQuery jQuery object of the week row.
     */
    function constructWeekRow(){
        var j, $row;

        $row = $('<div>').addClass('calendar__row calendar__row--week');

        for(j = 0; j < 7; j++){(function (j){
            var $cell;

            $cell = $('<div>')
                .addClass('calendar__cell')
                .text(_options.dayNames[j].slice(0, 3));

            $row.append($cell);
        })(j);}

        return $row;
    }

    /**
     * Constructs the template of the calendar cell.
     *
     * @param currDate Current date.
     * @param monthView The Date object where the view is based on.
     * @param isWithinCurrMonth Boolean value indicating if the date is within the current view (specified by monthView).
     * @param id A random string.
     * @returns jQuery The template of the calendar cell.
     */
    function constructCell(currDate, monthView, isWithinCurrMonth, id){
        var $cell, $cellInput, $cellText, dateCurrDay;

        dateCurrDay = moment(monthView).set({ date: currDate, hour: 12, minute: 0, second: 0, millisecond: 0 }).toDate();
        $cell = $('<label>')
            .addClass('calendar__cell');

        // Use radio button for single selection
        $cellInput = $('<input>')
            .attr('type', 'radio')
            .attr('name', '_date' + id)
            .data('date', dateCurrDay)
            .val(moment(dateCurrDay).format('YYYY-MM-DD'));

        if (dateCurrDay.getMonth() === _dateToday.getMonth() &&
            dateCurrDay.getDate() === _dateToday.getDate() &&
            dateCurrDay.getFullYear() === _dateToday.getFullYear()){
            $cell.addClass('cell--today');
        }

        if (!isWithinCurrMonth){
            $cell.addClass('cell--boundary');
        }

        $cellText = $('<span>').html(currDate > 0 ? currDate : '&nbsp;');
        $cell.append($cellInput).append($cellText);

        return $cell;
    }

    /**
     * Constructs the calendar days.
     *
     * @param $body jQuery object for the calendar body.
     */
    function constructCalendarDays($body){
        var i, j, currDay, maxDays, id, isWithinCurrMonth, currMonth;

        currMonth = moment(_options.viewDate).subtract(1, 'month').toDate();
        maxDays = getMaxDays(currMonth);
        currDay = maxDays - moment(_options.viewDate).set('date', 1).day() + 1;

        id = Math.floor(Math.random() * 999999);
        isWithinCurrMonth = false;

        for(i = 0; i < 6; i++){(function (){
            var $row;

            $row = $('<div>').addClass('calendar__row');

            for(j = 0; j < 7; j++, currDay++){(function (){
                if (currDay > maxDays){
                    isWithinCurrMonth = !isWithinCurrMonth;
                    currDay = 1;
                    currMonth = moment(currMonth).add(1, 'month').toDate();
                    maxDays = getMaxDays(currMonth);
                }

                $row.append(constructCell(currDay, currMonth, isWithinCurrMonth, id));
            })();}

            $body.append($row);
        })();}
    }

    /**
     * Constructs the template of the calendar body (week names and days).
     *
     * @returns jQuery The jQuery template of the calendar.
     */
    function constructCalendarBody(){
        var $body;

        $body = $('<div>').addClass('calendar__body');

        $body.append(constructWeekRow());
        constructCalendarDays($body);

        return $body;
    }

    /**
     * Highlights the date range selected.
     */
    function highlightRange(){
        var $cell, $cellInput;

        $cell = $this.find('.calendar__cell');

        $cell.removeClass('active');

        $cellInput = $cell.find('input');

        $cellInput.each(function (i, input){
            var $input;

            $input = $(input);

            if (_options.startDate <= $input.data('date') && $input.data('date') < _options.endDate){
                $input.parent().addClass('active');
            }
        });
    }

    /**
     * Binds the month selector events.
     */
    function bindMonthSelectorEvents(){
        var $prev, $next, $selection;

        $selection = $this.find('.header__month-select');
        $prev = $selection.first();
        $next = $selection.last();

        $prev.on('click', function (event){
            event.preventDefault();

            _options.viewDate = moment(_options.viewDate).subtract(1, 'month').toDate();

            refresh();
        });

        $next.on('click', function (event){
            event.preventDefault();

            _options.viewDate = moment(_options.viewDate).add(1, 'month').toDate();

            refresh();
        });
    }

    /**
     * Binds the calendar date events, upon selecting date ranges.
     */
    function bindCalendarDateEvents(){
        $this.on('click', 'input', function (){
            _options.startDate = $(this).data('date') || _options.startDate;

            commitValue();
        });
    }

    /**
     * Binds all events.
     */
    function bindEvents(){
        bindMonthSelectorEvents();
        bindCalendarDateEvents();
    }

    /**
     * Repaints the whole calendar.
     */
    function repaint(){
        $this
            .find('.vacation__calendar')
            .html('')
            .append(constructCalendarHeader())
            .append(constructCalendarBody());

        _events['changeview'].forEach(function (fn){
            fn.call($instance, {
                startDate: _options.startDate,
                endDate: _options.endDate,
                range: _options.range
            });
        });

        commitValue();
    }

    /**
     * Refreshes the calendar, repainting and rebinding events.
     */
    function refresh(){
        repaint();
        bindEvents();
    }

    /**
     * Commits the values.
     */
    function commitValue(){
        _options.endDate = moment(_options.startDate).add(_options.range, 'days').toDate();

        _events['change'].forEach(function (fn){
            fn.call($instance, {
                startDate: _options.startDate,
                endDate: _options.endDate,
                range: _options.range
            });
        });

        highlightRange();
    }

    /**
     * Initializes the private variables.
     */
    function initVariables(){
        _dateToday = new Date();
        _events = {
            'change': [],
            'changeview': []
        };
    }

    /**
     * The instance object, which exposes public methods.
     */
    $instance = {
        get: function (which){
            switch (which){
                case 'startDate':
                case 'endDate':
                case 'viewDate':
                case 'range':
                    return _options[which];
                default:
                    break;
            }
            return undefined;
        },
        set: function (which, value){
            switch (which){
                case 'startDate':
                case 'endDate':
                case 'range':
                    _options[which] = value;
                    commitValue();
                    break;
                case 'viewDate':
                    _options[which] = value;
                    repaint();
                    break;
                default:
                    break;
            }
            return $this;
        },
        on: function (event, cb){
            _events[event].push(cb);
            return $this;
        },
        off: function (event){
            _events[event] = [];
            return $this;
        }
    };

    /**
     * Adds the vacation plugin to jQuery.
     * @param options The hash of available options.
     * @returns {$.fn}
     */
    $.fn.vacation = function (options){
        $this = this;

        initVariables();
        initOptions(options);

        this.data('vacation', $instance);

        refresh();

        return this;
    };
})();
