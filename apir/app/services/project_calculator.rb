class ProjectCalculator
  def self.invoices_counts(projects)
    projects.joins(:invoices).group(:id).count
  end

  def self.positions_counts(projects)
    projects.left_joins(project_positions: :project_efforts).group(:id).sum(:value)
  end

  def budget_price
    if offer.nil?
      nil
    else
      if offer.fixed_price.nil?
        CostBreakdown.new(offer.offer_positions, offer.offer_discounts, offer.position_groupings, offer.fixed_price).calculate[:total]
      else
        offer.fixed_price
      end
    end
  end

  def budget_time
    if offer.nil?
      nil
    else
      offer.offer_positions.inject(0) { |sum, p| sum + p.estimated_work_hours }
    end
  end

  def current_price
    project_positions.inject(0) { |sum, p| sum + p.charge }
  end

  def current_time
    project_positions.inject(0) do |sum, p|
      if p.rate_unit.nil? or not p.rate_unit.is_time
        sum
      else
        sum + p.efforts_value * p.rate_unit.factor
      end
    end
  end
end
