//download elastic_search v7 and kibana

then run below commands for setup the index using cmd

    // for create index and mapping
    curl -H "Content-Type: application/json" -d @mapping.json -X PUT http://localhost:9200/song_lyrics/

    //for bulk insertion of data (add a newline in the end of file if any error occur)
    curl -H "Content-Type: application/json" --data-binary @songs_list.txt -X POST http://localhost:9200/_bulk/

    //for delete the index
    curl -X DELETE http://localhost:9200/song_lyrics


kibana console can be used for all the above and queries as well
