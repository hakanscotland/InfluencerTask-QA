# @influencer @opportunities
# Feature: Influencer Opportunities
#   As an influencer user
#   I want to discover and apply to campaigns
#   So that I can earn from brand collaborations
# 
#   Background:
#     Given I am logged in as an "influencer" user
#     And I navigate to the "influencer opportunities" page
# 
#   Scenario: Opportunities page loads with campaign cards
#     Then I should see the element with test id "opportunities-page"
# 
#   Scenario: Filter opportunities by category
#     When I select "Fashion" from the dropdown with test id "opportunities-filter-category"
#     Then I should see the element with test id "opportunities-page"
# 
#   Scenario: Navigate to an opportunity detail
#     When I click the element with test id matching pattern "opportunity-card-.*"
#     Then the URL should contain "/influencer/opportunities/"
# 
#   @mobile
#   Scenario: Opportunities on mobile
#     Given I set viewport to mobile
#     Then I should see the element with test id "opportunities-page"

