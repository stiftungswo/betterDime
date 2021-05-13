# frozen_string_literal: true

require "prawn"

module Pdfs
  class OfferPdf < BasePdf
    def initialize(global_setting, offer, date)
      @global_setting = global_setting
      @offer = offer
      @date = date
      super()
    end

    def filename
      "Offerte_" + @offer.id.to_s + "_" + @offer.name.split(",")[0].split(";")[0] + "_" + @offer.created_at.strftime("%Y_%m_%d")
    end

    def data
      @offer
    end

    def project
      @project = Project.find_by_offer_id(data.id)
    end

    def invoice
      @invoice = Invoice.find_by_project_id(project.id) if project
    end

    def draw
      header = Pdfs::Generators::MailHeaderGenerator.new(document, @global_setting, @offer, @date)
      
      header.draw(@default_text_settings, true)
      header.draw_title(:offer)

      draw_description(header)
      draw_breakdown
      draw_signature
    end

    def draw_description(header)
      move_down 70

      costgroups = nil

      if project
        costgroups = project.project_costgroup_distributions.map do |c|
          c.weight.to_s + "% " + c.costgroup_number.to_s
        end.join(", ")
      end

      header.draw_misc(invoice, project, data, data.accountant, costgroups, :offer, data.name)

      move_down 20

      Redcarpet::Markdown.new(Pdfs::Markdown::PdfRenderer.new(document, @spacing, @leading))
        .render((@offer.description[0] == '#' ? "" : "#Projektbeschrieb\n") + @offer.description)
    end

    def draw_breakdown
      move_down 40 if cursor > 40
      start_new_page if cursor < 100

      Pdfs::Generators::BreakdownTableGenerator.new(document, @offer.breakdown).render(
        [I18n.t(:position), I18n.t(:price_per_unit_chf), I18n.t(:unit), I18n.t(:quantity), I18n.t(:vat), I18n.t(:subtotal_chf_excl_vat)]
      )

      move_down 10
      text I18n.t(:payable_deadline, days: 30), @default_text_settings
    end

    def draw_signature
      start_new_page if cursor < 100

      bounding_box([0, 70], width: bounds.width, height: 150) do
        float do
          indent(10, 0) do
            text I18n.t(:signature_contractor), @default_text_settings.merge(size: 10, style: :bold)
          end
        end

        indent(bounds.width / 2.0 + 50, 0) do
          text I18n.t(:signature_client), @default_text_settings.merge(size: 10, style: :bold)
        end

        move_down 50

        bounding_box([10, cursor], width: bounds.width / 2.0 - 75, height: 20) do
            stroke_horizontal_rule
            move_down 4
            text I18n.t(:place) + " / " + I18n.t(:date_name), @default_text_settings
        end

        move_up 20

        bounding_box([bounds.width / 2.0 + 50, cursor], width: bounds.width / 2.0 - 75, height: 20) do
          stroke_horizontal_rule
          move_down 4
          text I18n.t(:place) + " / " + I18n.t(:date_name), @default_text_settings
        end
      end
    end
  end
end
