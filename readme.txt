//scrape
read the readme.txt file inside  scape folder for scraping part

//format_songs
read the readme.txt file inside format_songs for format the scraped songs

//elastic_search
read readme.txt file inside elastic_search for elastic_search mapping and queries 

//data
data file consist of unformat_songs folder which consist of all the songs scraped as it inside
format_songs folder consist of all the songs after cleaning unnecessary parts like chords 
songs_list.txt file is the final file ready to be uploaded to elastic search

//query_parser
this can be used to generate queries
use my_query_parser_v3.js as it is the newest version
change the text value inside the file as required and run below command
    node my_query_parser_v3.js
a query.json file will be gererated inside the folder. that query can be used to search in elastic search

