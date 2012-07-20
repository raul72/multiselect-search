/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    concat: {
      basic: {
        src: ['<banner:meta.banner>', '<file_strip_banner:src/mss.js>'],
        dest: 'dist/mss/mss.js'
      },
      jquery: {
        src: ['<banner:meta.banner>', '<file_strip_banner:src/mss.js>', '<file_strip_banner:src/jquery.mss.js>'],
        dest: 'dist/jquery.mss/jquery.mss.js'
      },
      css: {
        src: ['<file_strip_banner:src/mss.css>'],
        dest: 'dist/mss/mss.css'
      },
      jquerycss: {
        src: ['<file_strip_banner:src/mss.css>', '<file_strip_banner:src/jquery.mss.css>'],
        dest: 'dist/jquery.mss/jquery.mss.css'
      }
    },
    min: {
      basic: {
        src: ['<banner:meta.banner>', '<config:concat.basic.dest>'],
        dest: 'dist/mss/mss.min.js'
      },
      jquery: {
        src: ['<banner:meta.banner>', '<config:concat.jquery.dest>'],
        dest: 'dist/jquery.mss/jquery.mss.min.js'
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    lint: {
      files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
      options: {
        strict: false,
        forin: true,
        noarg:true,
        noempty: true,
        eqeqeq: true,
        bitwise: true,
        undef: true,
        curly: true,
        browser: true,
        indent: 4,
        maxerr: 900,
        smarttabs: true,
        latedef: true,
        asi: false
      },
      globals: {
        jQuery: true,
        multiselect_search: true
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint qunit concat min');

};