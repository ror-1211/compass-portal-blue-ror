require 'rails_helper'

describe "New rooms page", type: :feature do

  it "redirects to the login page" do
    visit new_room_path
    expect(page).to have_content('You are not authorized to access this page.')
    expect(page).to have_content('Login Page')
  end

  describe "when logged in" do
    before do
      sign_in(create(:user, admin: true))
    end

    it "exists at 'new_room_path' and render withour error" do
      visit new_room_path
    end

    it "fills the coordinate fields with the params" do
      visit '/rooms/new?lat=51&long=13'

      expect(page).to have_field('room[location_latitude]', with: 51)
      expect(page).to have_field('room[location_longitude]', with: 13)
    end
  end
end
