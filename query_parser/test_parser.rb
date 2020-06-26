require 'parslet'
include Parslet
require 'json'
# class MyParser < Parslet::Parser
#     rule(:term) {match('[a-zA-Z0-9]').repeat(1)}
#     rule(:space) {match('\s').repeat(1)}
#     rule(:query) {(term >> space.maybe).repeat}
#     root(:query)
# end

# class QueryParser < Parslet::Parser
#     rule(:term) { match('[^\s]').repeat(1).as(:term)}
#     rule(:space) {match('\s').repeat(1)}
#     rule(:query) { (term >> space.maybe).repeat.as(:query)}
#     root(:query)
# end

# #puts(QueryParser.new.parse("cat in the hat"))

# class QueryTransformer < Parslet::Transform
#     rule(:term => simple(:term)) {term.to_s}
#     rule(:query => sequence(:terms)) {Query.new(terms)}
# end

# class Query
#     attr_accessor :terms

#     def initialize(terms)
#         self.terms = terms
#     end

#     def to_elasticsearch
#         {
#             :query => {
#                 :match => {
#                     :title => {
#                         :query => terms.join(" "),
#                         :operator => "or"
#                     }
#                 }
#             }
#         }
#     end
# end

# parse_tree = QueryParser.new.parse("cat in the hat")
# query = QueryTransformer.new.apply(parse_tree)
#puts(query.to_elasticsearch)

class QueryParser < Parslet::Parser
    rule(:term) {match('[^\s]').repeat(1).as(:term)}
    rule(:operator) {(str('සහ ') | str('නැත ') | str('නැ ')).as(:operator)}
    rule(:clause) {(operator.maybe >> term).as(:clause)}
    rule(:space) {match('\s').repeat(1)}
    rule(:query) {(clause >> space.maybe).repeat.as(:query)}
    root(:query)
end
#puts(QueryParsert.new.parse("the +cat in the -hat"))


class Operator
    def self.symbol(str)
        case str
        when 'සහ ' 
            :must
        when 'නැත '
            :must_not
        when 'නැ '
            :must_not
        when nil
            :should
        else
            raise "Unknown operator: #{str}"
        end
    end
end

class Clause
    attr_accessor :operator, :term

    def initialize(operator, term)
        self.operator = Operator.symbol(operator)
        self.term = term
    end
end

class Query
    attr_accessor :should_terms, :must_not_terms, :must_terms

    def initialize(clauses)
        grouped = clauses.chunk {|c| c.operator}.to_h
        self.should_terms = grouped.fetch(:should, []).map(&:term)
        self.must_not_terms = grouped.fetch(:must_not,[]).map(&:term)
        self.must_terms = grouped.fetch(:must, []).map(&:term)
    end

    def to_elasticsearch
        query = {
            :query => {
                :bool => {
                }
            }
        }

        if should_terms.any?
            query[:query][:bool][:should] = should_terms.map do |term|
                match(term)
            end
        end

        if must_terms.any?
            query[:query][:bool][:must] = must_terms.map do |term|
                match(term)
            end
        end

        if must_not_terms.any?
            query[:query][:bool][:must_not] = must_not_terms.map do |term|
                match(term)
            end
        end

        query 
    end

    def match(term)
        {
            :match => {
                :title => {
                    :query => term
                }
            }
        }
    end
end


class QueryTransformer < Parslet::Transform
    rule(:clause => subtree(:clause)) do 
        Clause.new(clause[:operator]&.to_s, clause[:term].to_s)
    end
    rule(:query => sequence(:clauses)) {Query.new(clauses)}
end

parse_tree = QueryParser.new.parse("අමරදේව සහ ලතා")
query = QueryTransformer.new.apply(parse_tree)
query_ela = query.to_elasticsearch

my_json = JSON.generate(query_ela)
puts my_json