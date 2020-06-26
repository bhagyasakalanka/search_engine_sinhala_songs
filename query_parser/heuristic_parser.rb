require 'parslet'
include Parslet
require 'json'
class QueryParser < Parslet::Parser
    rule(:eof) {any.absent?}
    rule(:decade) do
        ((str('1') >> str('9') | 
        str('2') >> str('0')) >>
        match('\d') >> str('0')).as(:decade) >>
        str('s').maybe >> (eof | space).present?
    end
    rule(:term) {match('[^\s"]').repeat(1).as(:term)}
    rule(:quote) {str('"')}
    rule(:operator) {(str('+') | str('-')).as(:operator)}
    rule(:phrase) do
        (quote >> (term >> space.maybe).repeat >> quote).as(:phrase)
    end
    rule(:clause) {(operator.maybe >> (phrase | decade | term)).as(:clause)}
    rule(:space) {match('\s').repeat(1)}
    rule(:query) {(clause >> space.maybe).repeat.as(:query)}
    root(:query)
end
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

class DateRangeClause
    attr_accessor :operator, :start_year, :end_year

    def initialize(operator, decade)
        self.operator = Operator.symbol(operator)
        self.start_year = decade
        self.end_year = decade + 9
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
        when DateRangeClause
            date_range(clause.start_year, clause.end_year)
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

    def date_range(start_year, end_year)
        {
            :range => {
                :publication_year => {
                    :gte => start_year,
                    :lte => end_year
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
        elsif clause[:decade]
            DateRangeClause.new(clause[:operator]&.to_s, clause[:decade].to_i)
        else
            raise "Unexpected clause type: '#{clause}'"
        end
    end
    rule(:query => sequence(:clauses)){Query.new(clauses)}
end




parse_tree = QueryParser.new.parse('cats "in the hat" 1970s')

query = QueryTransformer.new.apply(parse_tree)

query_ela = query.to_elasticsearch

my_json = JSON.generate(query_ela)
puts my_json

