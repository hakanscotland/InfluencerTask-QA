@auth @register
Feature: User Registration
  As a new user
  I want to register with my email or social account
  So that I can access the platform

  Background:
    Given I am on the "register" page

  Scenario: Register page has role selection options
    Then I should see the element with test id "register-role-brand"
    And I should see the element with test id "register-role-influencer"
    And I should see the element with test id "register-role-user"
    And I should see the element with test id "register-form"

  Scenario: Register form contains all required fields
    Then I should see the element with test id "register-name-input"
    And I should see the element with test id "register-email-input"
    And I should see the element with test id "register-password-input"
    And I should see the element with test id "register-password-toggle"
    And I should see the element with test id "register-submit-button"
    And I should see the element with test id "register-google-button"
    And I should see the element with test id "register-login-link"

  Scenario: Password visibility toggle works on register
    When I fill the field with test id "register-password-input" with "Secret123!"
    And I click the element with test id "register-password-toggle"
    Then the element with test id "register-password-input" should have value "Secret123!"

  Scenario: Select influencer role and see active state
    When I click the element with test id "register-role-influencer"
    Then the element with test id "register-role-influencer" should be enabled

  Scenario: Select brand role and see active state
    When I click the element with test id "register-role-brand"
    Then the element with test id "register-role-brand" should be enabled

  Scenario: Navigate to login page from register
    When I click the element with test id "register-login-link"
    Then the URL should contain "/login"
    And I should see the element with test id "login-page"

  @slow
  Scenario: Attempt registration with existing email shows error toast
    When I click the element with test id "register-role-brand"
    And I fill the field with test id "register-name-input" with "Existing User"
    And I fill the field with test id "register-email-input" with "marka@influencerportal.com.tr"
    And I fill the field with test id "register-password-input" with "SomePassword123!"
    And I click the element with test id "register-submit-button"
    Then I should see a toast message containing "e-posta"
