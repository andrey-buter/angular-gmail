

module.exports = function(grunt) {
	// include for ES6 Promises for postCss 
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// Maybe move to package.json
		include_files: {
			js: [
				'js/src/app.js',
				'js/src/config-ui-route.js',
				'js/src/services-db.js',
				'js/src/services.js',
				'js/src/components.js',
				'js/src/inbox/components.js',
				'js/src/inbox/services.js',
				'js/src/spam/components.js',
				'js/src/spam/components.js',
			],
		},

		concat: {
			dist: {
				files: {
					// '<%= pkg.build.js %>/common.es6.js': '<%= pkg.src.js %>/<%= include_files.js %>'
					'<%= pkg.build.js %>/common.es6.js': '<%= include_files.js %>'
				}
			}
		},

		babel: {
			options: {
				sourceMap: true,
				presets: ['es2015'],
			},
			dist: {
				files: {
					'<%= pkg.build.js %>/common.js': '<%= pkg.build.js %>/common.es6.js'
				}
			}
		},

		uglify: {
			my_target: {
				options: {
					mangle: false
				},
				files: {
					'<%= pkg.build.js %>/common.min.js': '<%= pkg.build.js %>/common.js'
				}
			}
		},
		
		watch: {
			grunt: { 
				files: ['Gruntfile.js'] 
			},
			js: {
				files: ['<%= pkg.src.js %>/**/*.js'],
				tasks: ['build'],
				options: {
					livereload: true,
				}
			},
		},	

	});


	// grunt.loadNpmTasks('grunt-contrib-watch');
	// grunt.loadNpmTasks('grunt-contrib-concat');
	// grunt.loadNpmTasks('grunt-contrib-uglify');
	// grunt.loadNpmTasks('grunt-contrib-clean');

	require("load-grunt-tasks")(grunt); 


	grunt.registerTask('build', ['concat' , 'babel:dist', 'uglify' ]);
};