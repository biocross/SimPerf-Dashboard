import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

import { Launches } from '../imports/launches.js';
import { Session } from 'meteor/session';

if (Meteor.isClient) {

  final = Launches;

  Template.body.onCreated(function(){
    Meteor.subscribe('launches');
  });


  Template.leaderboard.helpers ({
    players: function () {
      return Launches.find({}, { sort: { startTime: -1 } });
    },
    selectedName: function () {
      var player = Launches.findOne(Session.get("selectedPlayer"));
      return player && player.name;
    }
  });

  Template.singleLaunch.helpers ({
    'moment': function(timestamp) {
      var string = moment(timestamp, 'x').format('h:mm A') + " (" + moment(timestamp, 'x').fromNow() + ")";
      return string;
    },

    'timeToHome': function(){
      var finalData = this.details[2];
      var startOfMain;
      var startOfHome;

      finalData.forEach(function(singleFunction){
          if(singleFunction[1] === "Main") {
            startOfMain = singleFunction[2];
          }

          if(singleFunction[1] === "HomeVCViewDidLoad") {
            startOfHome = singleFunction[2];
          }
      });


      return startOfHome - startOfMain;
    },

    'baselineComparison': function(){



      var finalData = this.details[2];
      var startOfMain;
      var startOfHome;

      finalData.forEach(function(singleFunction){
          if(singleFunction[1] === "Main") {
            startOfMain = singleFunction[2];
          }

          if(singleFunction[1] === "HomeVCViewDidLoad") {
            startOfHome = singleFunction[2];
          }
      });


      var currentTimeToHome = startOfHome - startOfMain;

      var currentBaseline = Session.get("comparisonBaseline");
      if(!currentBaseline) {
        return "No Baseline Set";
      }

      var finalData = currentBaseline.details[2];
      var startOfMain;
      var startOfHome;

      finalData.forEach(function(singleFunction){
          if(singleFunction[1] === "Main") {
            startOfMain = singleFunction[2];
          }

          if(singleFunction[1] === "HomeVCViewDidLoad") {
            startOfHome = singleFunction[2];
          }
      });

      var baselineTimeToHome = startOfHome - startOfMain;

      var difference = currentTimeToHome - baselineTimeToHome;
      var percentage = (difference/baselineTimeToHome)*100;
      var string = String(Math.round(difference)) + " ms (" + String(Math.round(percentage)) + "%)";

      return string;
    },

    'isBaseline': function(){
      var currentBaseline = Session.get("comparisonBaseline");
      if(!currentBaseline) {
        return false;
      }
      return (this._id === currentBaseline._id);
    },

    'compare': function() {

      var baseline = Session.get("comparisonBaseline");
      if(!baseline) {
        return "Select a Baseline";
      }

      var currentKey = this.name;
      var baselineData = baseline.summary;

      var comparisonDataPoint;
      baselineData.forEach(function(data){
        if(data.name === currentKey) {
          comparisonDataPoint = data;
          
        }
      });

      if(comparisonDataPoint){
        var difference = this.average - comparisonDataPoint.average;
        var percentage = (difference/comparisonDataPoint.average)*100;
        var string = String(Math.round(difference)) + " ms (" + String(Math.round(percentage)) + "%)";
        return string;
      }

      return "Unable to Calculate";
    },

    'round': function(decimal){
      return String(Math.round(decimal)) + " ms";
    }

  });

  Template.singleLaunch.events ({
    'click .setBaseline': function(e){
      Session.set("comparisonBaseline", this);
    }
  });

  Template.ganttChart.rendered = function(){

      var containerElement = this.findAll(".gantt-container")[0];
      var launchData = this.data;

      google.charts.load('current', {'packages':['gantt']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart(){
        var dataTable = new google.visualization.DataTable();
        dataTable.addColumn({ type: 'string', id: 'function' });
        dataTable.addColumn({ type: 'date', id: 'Start' });
        dataTable.addColumn({ type: 'date', id: 'End' });

        var formattedData = [];

        var finalData = launchData.details[2];
        finalData.forEach(function(singleRow){
          var newRow = [];
          newRow.push(singleRow[0]);
          var startDate = new Date(singleRow[2]);
          var endDate = singleRow[2] + singleRow[3];
          endDate = new Date(endDate);
          newRow.push(startDate);
          newRow.push(endDate);
          formattedData.push(newRow);
        });
      
        dataTable.addRows(formattedData);

        var options = {
          height: 600
        };
        
        var chart = new google.visualization.Timeline(containerElement);
        chart.draw(dataTable, options);

      }
  }



} /* isClient */