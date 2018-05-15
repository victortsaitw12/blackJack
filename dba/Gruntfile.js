module.exports = function(grunt){
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      all: ['**/*.js']
    },
    nodemon: {
      dev: {
        script: 'index.js'
      }
    },
  });
  grunt.loadNpmTasks('grunt-contrib-nodemon');
  grunt.loadNpmTasks('eslint-grunt');
  grunt.registerTask('default', function(){
    grunt.task.run('nodemon');
  });
};
