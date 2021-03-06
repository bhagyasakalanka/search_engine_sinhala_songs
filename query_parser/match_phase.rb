require 'parslet'
include Parslet

class QueryParser < Parslet::Parser
    rule(:term) {match('[^\s"]').repeat(1).as(:term)}
    rule(:quote) {str('"')}
    rule(:operator) {(str('+') | str('-')).as(:operator)}
    rule(:phrase) do 
        (quote >> (term >> space.maybe).repeat >> quote).as(:phrase)
    end
    rule(:clause) { (operator.maybe >> (phrase | term)).as(:clause)}
    rule(:space) {match('\s').repeat(1)}
    rule(:query) {(clause >> space.maybe).repeat.as(:query)}
    root(:query)
end

# puts(QueryParser.new.parse('"cat in the hat" -green +ham'))
class Operator
    def self.symbol(str)
        case str
        when '+' 
            :must
        when '-'
            :must_not
        when nil
            :should
        else
            raise "Unknown operator: #{str}"
        end
    end
end

class TermClause
    attr_accessor :operator, :term

    def initialize(operator, term)
        self.operator = Operator.symbol(operator)
        self.term = term
    end
end

class PhraseClause
    attr_accessor :operator, :phrase

    def initialize(operator, phrase)
        self.operator = Operator.symbol(operator)
        self.phrase = phrase
    end
end

class Query 
    attr_accessor :should_clauses, :must_not_clauses, :must_clauses

    def initialize(clauses)
        grouped = clauses.chunk { |c| c.operator}.to_h
        self.should_clauses = grouped.fetch(:should, [])
        self.must_not_clauses = grouped.fetch(:must_not, [])
        self.must_clauses = grouped.fetch(:must, [])
    end

    def to_elasticsearch
        query = {
            :query => {
                :bool => {

                }
            }
        }

        if should_clauses.any?
            query[:query][:bool][:should] = should_clauses.map do |clause|
                clause_to_query(clause)
            end
        end

        if must_clauses.any?
            query[:query][:bool][:must] = must_clauses.map do |clause|
                clause_to_query(clause)
            end
        end

        if must_not_clauses.any?
            query[:query][:bool][:must_not] = must_not_clauses.map do |clause|
                clause_to_query(clause)
            end
        end

        query
    end

    def clause_to_query(clause)
        case clause
        when TermClause
            match(clause.term)
        when PhraseClause
            match_phrase(clause.phrase)
        else
            raise "Unknown clause type: #{clause}"
        end
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

    def match_phrase(phrase)
        {
            :match_phrase => {
                :title => {
                    :query => phrase
                }
            }
        }
    end
end

class QueryTransformer < Parslet::Transform
    rule(:clause => subtree(:clause)) do
        if clause[:term]
            TermClause.new(clause[:operator]&.to_s, clause[:term].to_s)
        elsif clause[:phrase]
            phrase = clause[:phrase].map {|p| p[:term].to_s}.join(" ")
            PhraseClause.new(clause[:operator]&.to_s, phrase)
        else
            raise "Unexpected clause type: '#{clause}'"
        end
    end
    rule(:query => sequence(:clauses)){Query.new(clauses)}
end

parse_tree = QueryParser.new.parse('"cat in the hat" -green +ham')
puts(parse_tree)
puts("\n\n")
query = QueryTransformer.new.apply(parse_tree)
puts(query)
puts(query.to_elasticsearch)