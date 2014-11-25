module.exports = function(grunt) {
	grunt.initConfig({
		package: grunt.file.readJSON('package.json'),

		clean: {
			artifacts: 'artifacts',
			dist: 'dist'
		},

		copy: {
			main: {
				src: 'css/<%= package.name %>.css',
				dest: 'dist/<%= package.name %>-<%= package.version %>.css'
			}
		},

		jscs: {
			all: {
				options: {
					config: 'config/jscs.json'
				},
				src: [
					'Gruntfile.js',
					'src/**/*.js'
				],
				gruntfile: 'Gruntfile.js'
			}
		},

		jshint: {
			all: {
				options: {
					jshintrc: 'config/jshint.json',
					reporter: require('jshint-stylish')
				},
				src: [
					'Gruntfile.js',
					'src/**/*.js'
				]
			}
		},

		uglify: {
			main: {
				options: {
					banner: '/*!\n<%= package.name %> v<%= package.version %> Generated <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n',
					preserveComments: 'some'
				},
				src: 'src/<%= package.name %>.js',
				dest: 'dist/<%= package.name %>-<%= package.version %>.min.js'
			}
		}
	});

	// Load grunt tasks from NPM packages
	require('load-grunt-tasks')(grunt);

	// Default grunt
	grunt.registerTask('default', [
		'jshint:all',
		'jscs:all',
		'copy:main',
		'uglify:main'
	]);
};
