class CreateRooms < ActiveRecord::Migration[6.1]
  def change
    create_table :rooms do |t|
      t.string :name
      t.string :floor
      t.string :room_type
      t.string :contact_person

      t.timestamps
    end
  end
end