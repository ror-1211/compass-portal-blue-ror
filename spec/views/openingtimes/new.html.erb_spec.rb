require 'rails_helper'

RSpec.describe "openingtimes/new", type: :view do
  before do
    assign(:openingtime, Openingtime.new(
                           day: 1,
                           opens: Tod::TimeOfDay.new(8, 0),
                           closes: Tod::TimeOfDay.new(17, 0)
                         ))
  end

  it "renders new openingtime form" do
    render

    assert_select "form[action=?][method=?]", openingtimes_path, "post" do

      assert_select "select[name=?]", "openingtime[day]"
    end
  end
end
