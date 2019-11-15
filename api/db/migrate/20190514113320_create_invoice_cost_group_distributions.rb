class CreateInvoiceCostGroupDistributions < ActiveRecord::Migration[5.2]
  def change
    create_table :invoice_cost_group_distributions do |t|
      t.references :cost_group, index: false, foreign_key: false
      t.integer :weight, null: false, default: 100, null: false

      t.timestamps
    end

    add_foreign_key :invoice_cost_group_distributions, :cost_groups, column: :cost_group_id, primary_key: :number
  end
end