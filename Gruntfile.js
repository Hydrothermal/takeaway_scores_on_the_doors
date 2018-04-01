module.exports = function(grunt) {

  grunt.initConfig({
    crx: {
      myPublicExtension: {
        src: "src/**/*",
        dest: "dist/takeaway_scores_on_the_doors.zip",
      }
    }
  });

  grunt.loadNpmTasks('grunt-crx');
  grunt.registerTask('default', ['crx']);

};