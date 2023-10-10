import Handlebars from 'handlebars/runtime';

// http://stackoverflow.com/a/16928455

Handlebars.registerHelper('select', function(selected, options) {
  return options.fn(this).replace(
    new RegExp(' value=\"' + selected + '\"'),
    '$& selected'
  );
});