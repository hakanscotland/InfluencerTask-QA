@smoke @regression @brand
Feature: Campaign Creation
  As a brand
  I want to create a campaign with tasks
  So that influencers can apply and complete work

  Background:
    Given I am logged in as a "brand" user
    And I navigate to the "brand campaigns" page

  Scenario: Open campaign wizard
    When I click the element with test id "brand-create-campaign-button"
    Then I should see the element with test id "campaign-wizard"
    And I should see the element with test id "campaign-wizard-step-1"
    And I should see the element with test id "campaign-wizard-progress-bar"

  Scenario: Fill campaign basic information (Step 1)
    Given I click the element with test id "brand-create-campaign-button"
    When I fill the field with test id "wizard-step-1-title-input" with "Summer Promo 2026"
    And I fill the field with test id "wizard-step-1-description-textarea" with "A summer promotional campaign for our new product line."
    And I select "Fashion" from the dropdown with test id "wizard-step-1-category-select"
    And I fill the field with test id "wizard-step-1-budget-input" with "5000"
    And I click the element with test id "campaign-wizard-next-button"
    Then I should see the element with test id "campaign-wizard-step-2"

  Scenario: Add a task in the task builder (Step 2)
    Given I click the element with test id "brand-create-campaign-button"
    And I fill the field with test id "wizard-step-1-title-input" with "Summer Promo 2026"
    And I fill the field with test id "wizard-step-1-description-textarea" with "A summer promotional campaign for our new product line."
    And I select "Fashion" from the dropdown with test id "wizard-step-1-category-select"
    And I fill the field with test id "wizard-step-1-budget-input" with "5000"
    And I click the element with test id "campaign-wizard-next-button"
    When I click the element with test id "wizard-step-2-add-task-button"
    Then I should see the element with test id "task-builder-task-item-0"

  Scenario: Complete full campaign wizard flow
    Given I click the element with test id "brand-create-campaign-button"
    # Step 1: Basic Info
    When I fill the field with test id "wizard-step-1-title-input" with "E2E Test Campaign"
    And I fill the field with test id "wizard-step-1-description-textarea" with "Automated test campaign"
    And I select "Technology" from the dropdown with test id "wizard-step-1-category-select"
    And I fill the field with test id "wizard-step-1-budget-input" with "1000"
    And I click the element with test id "campaign-wizard-next-button"
    # Step 2: Tasks
    And I click the element with test id "wizard-step-2-add-task-button"
    And I select "Instagram" from the dropdown with test id "task-builder-platform-select-0"
    And I select "Story Share" from the dropdown with test id "task-builder-task-type-select-0"
    And I fill the field with test id "task-builder-reward-input-0" with "50"
    And I click the element with test id "campaign-wizard-next-button"
    # Step 3: Targeting
    And I click the element with test id "campaign-wizard-next-button"
    # Step 4: Review & Submit
    And I click the element with test id "campaign-wizard-submit-button"
    Then I should see the element with test id "campaign-table"
    And the element with test id "campaign-table" should contain text "E2E Test Campaign"
