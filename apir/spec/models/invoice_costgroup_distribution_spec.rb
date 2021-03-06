# frozen_string_literal: true

require "rails_helper"

RSpec.describe InvoiceCostgroupDistribution, type: :model do
  it { is_expected.to validate_presence_of :costgroup }
  it { is_expected.to validate_presence_of :weight }
  it { is_expected.to validate_presence_of :invoice }
  it { is_expected.to validate_numericality_of(:weight).is_greater_than_or_equal_to 0 }
end
