# frozen_string_literal: true

class ProjectCategoryDistribution < ApplicationRecord
  include SoftDeletable

  belongs_to :project_category, foreign_key: :category_id
  belongs_to :project

  validates :weight, presence: true
  validates :weight, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
