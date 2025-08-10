class Item < ApplicationRecord
  has_many :user_items, dependent: :destroy
end
