module.exports = function(grunt) {
	grunt.initConfig({
		package: grunt.file.readJSON('package.json'),

		clean: {
			artifacts: 'artifacts',
			build: 'build'
		},

		copy: {
			main: {
				src: 'css/<%= package.name %>.css',
				dest: 'build/<%= package.name %>/<%= package.version %>/<%= package.name %>-<%= package.version %>.css'
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
				dest: 'build/<%= package.name %>/<%= package.version %>/<%= package.name %>-<%= package.version %>.min.js'
			}
		}
	});

	// Load grunt tasks from NPM packages
	require('load-grunt-tasks')(grunt);

	grunt.registerTask('build', [
		'copy:main',
		'uglify:main'
	]);

	grunt.registerTask('lint', [
		'jshint:all',
		'jscs:all'
	]);

	// Default grunt
	grunt.registerTask('default', [
		'lint',
		'build'
	]);
};
