(function() {
    'use strict';

  angular
  .module('material.components.stepper',['ngMaterial'])
  .directive('mdStepper', stepperDirective)
  .directive('mdStep', stepDirective)
  .directive('mdStepCircle', stepCircleDirective)
  .directive('mdStepText', stepTextDirective);

  stepperDirective.$inject = [];

  function stepperDirective() {

    /**
    Vertical
    <div class="stepper">
      <div class="step step-active">
        <div>
          <div class="circle">n</div>
          <div class="line"></div>
        </div>
        <div>
          <div class="title">Title</div>
          <div class="body">Body</div>
        </div>
      </div>
    </div>
    Horizontal
    <div class="stepper">
      <div class="step">
        <div>
          <div class="circle">n</div>
        </div>
        <div>
          <div class="title">Title</div>
          <div class="body">Body</div>
        </div>
        <div>
          <div class="line"></div>
        </div>
      </div>
    </div>
    */


    return {
      restrict:'E',
      scope: {
        direction: '@mdDirection',
      },
      link: stepperLink
    }

  
    function stepperLink(scope, element, attr) {
      element.addClass('stepper');
      var direction = scope.direction;
      element.addClass('layout-row');
      element.addClass('stepper-' +  direction);
    }

  }

  /**
  Step
  */

  stepDirective.$inject = ['$compile'];

  function stepDirective($compile) {

    var verticalTemplate = '<div class="step layout-column"><div><div class="step-circle">{{number}}</div><div class="step-line flex"></div></div><div><div class="step-title">{{title}}</div><div class="step-text">{{text}}</div></div></div>';

    var horizontalTemplate = '<ng-transclude></ng-transclude><div class="step-line flex"></div>';

    var getTemplate = function(direction) {
        var template = '';

        switch(direction) {
            case 'vertical':
                template = verticalTemplate;
                break;
            case 'horizontal':
                template = horizontalTemplate;
                break;
        }
        return template;
    }


    return {
      restrict:'E',
      transclude: 'true',
      template: '<div class="layout-row" ng-transclude></div><md-step-line class="flex"></md-step-line>',
      scope: {},
      link: stepLink
    }

    function stepLink(scope, element, attr) {
      //element.html(getTemplate('horizontal'));
      //$compile(element.contents())(scope);
      //<div class="step layout-row flex" ng-class="{\'active\':active, \'optional\':optional, \'done\':done}">
      element.addClass('layout-row');
      element.addClass('flex');
    }

  }  


  /**
  Step circle
  */
  function stepCircleDirective() {
    return {
      restrict:'E',
    }
  } 

  /**
  Step text
  */
  function stepTextDirective() {
    return {
      restrict:'E',
      transclude: true,
      template: '<ng-transclude></ng-transclude><div ng-if="optional" class="step-optional">Optional</div>',
      scope: {
        optional: '=mdStepOptional',
      },
      link: stepTextLink
    }

    function stepTextLink(scope, element, attr) {
      if(scope.optional === true) {
        element.addClass('optional');
      }
    }

  } 
  
})();