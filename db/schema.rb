# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2022_02_13_145922) do

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.integer "record_id", null: false
    t.integer "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.integer "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "building_owner", id: false, force: :cascade do |t|
    t.integer "building_id", null: false
    t.integer "user_id", null: false
  end

  create_table "buildings", force: :cascade do |t|
    t.string "name"
    t.float "location_latitude"
    t.float "location_longitude"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "name_de"
  end

  create_table "events", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.datetime "start_time"
    t.datetime "end_time"
    t.text "recurring"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "room_id"
    t.index ["room_id"], name: "index_events_on_room_id"
  end

  create_table "favourites", force: :cascade do |t|
    t.integer "user_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "favourable_type"
    t.integer "favourable_id"
    t.index ["favourable_type", "favourable_id"], name: "index_favourites_on_favourable"
  end

  create_table "location_owner", id: false, force: :cascade do |t|
    t.integer "location_id", null: false
    t.integer "user_id", null: false
  end

  create_table "locations", force: :cascade do |t|
    t.string "name"
    t.text "details"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.float "location_latitude"
    t.float "location_longitude"
    t.string "name_de"
    t.text "details_de"
  end

  create_table "openingtimes", force: :cascade do |t|
    t.time "opens"
    t.time "closes"
    t.integer "day"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "timeable_type"
    t.integer "timeable_id"
    t.index ["timeable_type", "timeable_id"], name: "index_openingtimes_on_timeable"
  end

  create_table "people", force: :cascade do |t|
    t.string "phone_number"
    t.string "first_name"
    t.string "last_name"
    t.string "email"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "people_rooms", id: false, force: :cascade do |t|
    t.integer "person_id", null: false
    t.integer "room_id", null: false
  end

  create_table "person_owner", id: false, force: :cascade do |t|
    t.integer "person_id", null: false
    t.integer "user_id", null: false
  end

  create_table "room_owner", id: false, force: :cascade do |t|
    t.integer "room_id", null: false
    t.integer "user_id", null: false
  end

  create_table "rooms", force: :cascade do |t|
    t.string "name"
    t.integer "floor"
    t.string "room_type"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "building_id"
    t.integer "user_id"
    t.float "location_latitude"
    t.float "location_longitude"
    t.string "name_de"
    t.index ["building_id"], name: "index_rooms_on_building_id"
    t.index ["user_id"], name: "index_rooms_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "provider"
    t.string "uid"
    t.string "username"
    t.integer "person_id"
    t.boolean "admin", default: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["person_id"], name: "index_users_on_person_id"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "events", "rooms"
  add_foreign_key "rooms", "buildings"
  add_foreign_key "rooms", "users"
  add_foreign_key "users", "people"
end
