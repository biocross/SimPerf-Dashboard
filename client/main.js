import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

import { Launches } from '../imports/launches.js';
import { Session } from 'meteor/session';
import Tablesort from 'tablesort';

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
      var finalData = this.details;
      var startOfMain;
      var startOfHome;

      finalData.forEach(function(singleFunction){
          if(singleFunction[0] === "Main") {
            startOfMain = singleFunction[1];
          }

          if(singleFunction[0] === "ServicesFetch") {
            startOfHome = singleFunction[1];
          }
      });


      return startOfHome - startOfMain;
    },

    'baselineComparison': function(){
      var finalData = this.details;
      var startOfMain;
      var startOfHome;

      finalData.forEach(function(singleFunction){
          if(singleFunction[0] === "Main") {
            startOfMain = singleFunction[1];
          }

          if(singleFunction[0] === "ServicesFetch") {
            startOfHome = singleFunction[1];
          }
      });


      var currentTimeToHome = startOfHome - startOfMain;

      var currentBaseline = Session.get("comparisonBaseline");
      if(!currentBaseline) {
        return "No Baseline Set";
      }

      var finalData = currentBaseline.details;
      var startOfMain;
      var startOfHome;

      finalData.forEach(function(singleFunction){
          if(singleFunction[0] === "Main") {
            startOfMain = singleFunction[1];
          }

          if(singleFunction[0] === "ServicesFetch") {
            startOfHome = singleFunction[1];
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

  Template.singleLaunch.rendered = function() {
    (function(){
      var cleanNumber = function(i) {
        return i.replace(/[^\-?0-9.]/g, '');
      },
    
      compareNumber = function(a, b) {
        a = parseFloat(a);
        b = parseFloat(b);
    
        a = isNaN(a) ? 0 : a;
        b = isNaN(b) ? 0 : b;
    
        return a - b;
      };
    
      Tablesort.extend('number', function(item) {
        return item.match(/^[-+]?[£\x24Û¢´€]?\d+\s*([,\.]\d{0,2})/) || // Prefixed currency
          item.match(/^[-+]?\d+\s*([,\.]\d{0,2})?[£\x24Û¢´€]/) || // Suffixed currency
          item.match(/^[-+]?(\d)*-?([,\.]){0,1}-?(\d)+([E,e][\-+][\d]+)?%?$/); // Number
      }, function(a, b) {
        a = cleanNumber(a);
        b = cleanNumber(b);
    
        return compareNumber(b, a);
      });
    }());

    new Tablesort(document.getElementById(this.data.startTime));
  }

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

        var finalData = launchData.details;
        finalData.forEach(function(singleRow){
          var newRow = [];
          newRow.push(singleRow[0]);
          var startDate = new Date(singleRow[1]);
          var endDate = singleRow[1] + singleRow[2];
          endDate = new Date(endDate);
          newRow.push(startDate);
          newRow.push(endDate);
          formattedData.push(newRow);
        });
      
        dataTable.addRows(formattedData);

        var options = {
          height: 800
        };
        
        var chart = new google.visualization.Timeline(containerElement);
        chart.draw(dataTable, options);

      }
  }



} /* isClient */