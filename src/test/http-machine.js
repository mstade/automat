import Automat from '../automat'

export { http, http as default }

function http(request) {
  const res = Object.defineProperties({},
    { code     : { writable: true , enumerable: true  }
    , message  : { writable: true , enumerable: true  }
    , header   : { value: header  , enumerable: true  }
    , body     : { writable: true , enumerable: true  }
    }
  )

  return protocol(request, { res })

  function header(name, value) {
    return value === undefined? headers[name] : (headers[name] = value)
  }
}

export const protocol = Automat("block_system",
  { "block_system": () => "is_service_available"
  , "is_service_available":
    [ no => "503_SERVICE_UNAVAILABLE"
    , yes => "is_uri_too_long" ]
  , "is_uri_too_long": 
    [ yes => "414_URI_TOO_LONG"
    , no => "are_headers_too_large" ]
  , "are_headers_too_large":
    [ yes => "431_REQUEST_HEADER_FIELDS_TOO_LARGE"
    , no => "is_method_implemented" ]

  , "is_method_implemented":
    [ no => "501_NOT_IMPLEMENTED"
    , yes => "are_content_headers_implemented" ]
  , "are_content_headers_implemented":
    [ no => "501_NOT_IMPLEMENTED"
    , yes => "is_functionality_implemented" ]
  , "is_functionality_implemented":
    [ no => "501_NOT_IMPLEMENTED"
    , yes => "are_expect_extensions_implemented" ]
  , "are_expect_extensions_implemented":
    [ no => "417_EXPECTATION_FAILED"
    , yes => "is_system_block_ok" ]
  , "is_system_block_ok":
    [ no => "500_INTERNAL_SERVER_ERROR"
    , yes => "block_request" ]

  , "block_request": () => "is_method_allowed"
  , "is_method_allowed": 
    [ no => "405_METHOD_NOT_ALLOWED"
    , yes => "is_authorized" ]
  , "is_authorized":
    [ no => "401_UNAUTHORIZED"
    , yes => "expects_continue" ]
  , "expects_continue":
    [ yes => "100_CONTINUE"
    , no => "has_content" ]
  , "has_content":
    [ no => "is_forbidden"
    , yes => "is_content_too_large" ]
  , "is_content_too_large":
    [ yes => "413_PAYLOAD_TOO_LARGE"
    , no => "is_content_type_accepted" ]
  , "is_content_type_accepted":
    [ no => "415_UNSUPPORTED_MEDIA_TYPE"
    , yes => "from_content" ]
  , "from_content":
    [ no => "400_BAD_REQUEST"
    , yes => "is_forbidden" ]
  , "is_forbidden":
    [ yes => "403_FORBIDDEN"
    , no => "is_method_trace" ]
  , "is_method_trace":
    [ yes => "200_OK"
    , no => "is_method_options" ]
  , "is_method_options":
    [ yes => "200_OK_alternative"
    , no => "is_request_block_ok" ]
  , "is_request_block_ok":
    [ no => "400_BAD_REQUEST"
    , yes => "block_accept" ]

  , "block_accept": () => "has_accept"
  , "has_accept": 
    [ no => "has_accept_language"
    , yes => "accept_matches" ]
  , "accept_matches": 
    [ no => "ignore_accept_block_mismatches"
    , yes => "has_accept_language" ]
  , "has_accept_language": 
    [ no => "has_accept_charset"
    , yes => "accept_language_matches" ]
  , "accept_language_matches": 
    [ no => "ignore_accept_block_mismatches"
    , yes => "has_accept_charset" ]
  , "has_accept_charset": 
    [ no => "has_accept_encoding"
    , yes => "accept_charset_matches" ]
  , "accept_charset_matches": 
    [ no => "ignore_accept_block_mismatches"
    , yes => "has_accept_encoding" ]
  , "has_accept_encoding": 
    [ no => "block_retrieve"
    , yes => "accept_encoding_matches" ]
  , "accept_encoding_matches": 
    [ no => "ignore_accept_block_mismatches"
    , yes => "block_retrieve" ]
  , "ignore_accept_block_mismatches": 
    [ no => "406_NOT_ACCEPTABLE"
    , yes => "block_retrieve" ]

  , "block_retrieve": () => "missing"
  , "missing":
    [ yes => "block_precondition_missing"
    , no => "block_precondition" ]

  , "block_retrieve_missing": () => "moved"
  , "moved":
    [ no => "block_create"
    , yes => "moved_permanently" ]
  , "moved_permanently":
    [ yes => "308_PERMANENT_REDIRECT"
    , no => "moved_temporarily" ]
  , "moved_temporarily":
    [ yes => "307_TEMPORARY_REDIRECT"
    , no => "gone_permanently" ]
  , "gone_permanently":
    [ yes => "410_GONE"
    , no => "block_create" ]

  , "block_precondition_missing": () => "missing_has_precondition"
  , "missing_has_precondition":
    [ yes => "412_PRECONDITION_FAILED"
    , no => "block_retrieve_missing" ]

  , "block_precondition": () => "has_if_match"
  , "has_if_match":
    [ yes => "if_match_matches"
    , no => "has_if_unmodified_since" ]
  , "if_match_matches":
    [ no => "412_PRECONDITION_FAILED"
    , yes => "has_if_none_match" ]
  , "has_if_unmodified_since":
    [ no => "has_if_none_match"
    , yes => "if_unmodified_since_matches" ]
  , "if_unmodified_since_matches":
    [ yes => "has_if_none_match"
    , no => "412_PRECONDITION_FAILED" ]
  , "has_if_none_match":
    [ yes => "if_none_match_matches"
    , no => "has_if_modified_since" ]
  , "if_none_match_matches":
    [ yes => "block_process"
    , no => "is_precondition_safe" ]
  , "has_if_modified_since":
    [ no => "block_process"
    , yes => "if_modified_since_matches" ]
  , "if_modified_since_matches":
    [ no => "is_precondition_safe"
    , yes => "block_process" ]
  , "is_precondition_safe":
    [ yes => "304_NOT_MODIFIED"
    , no => "412_PRECONDITION_FAILED" ]

  , "block_create": () => "create_is_method_put"
  , "create_is_method_put":
    [ yes => "create_partial_put"
    , no => "is_method_create" ]
  , "create_partial_put":
    [ yes => "400_BAD_REQUEST"
    , no => "create_has_conflict" ]
  , "create_has_conflict":
    [ yes => "409_CONFLICT"
    , no => "block_response_create" ]
  , "is_method_create":
    [ no => "404_NOT_FOUND"
    , yes => "create_path" ]
  , "create_path":
    [ no => "500_INTERNAL_SERVER_ERROR"
    , yes => "create" ]
  , "create":
    [ no => "500_INTERNAL_SERVER_ERROR"
    , yes => "block_response_create" ]

  , "block_process": () => "is_method_head_get"
  , "is_method_head_get":
    [ yes => "block_response"
    , no => "is_method_delete" ]
  , "is_method_delete":
    [ yes => "process_delete"
    , no => "is_method_put" ]
  , "process_delete":
    [ no => "500_INTERNAL_SERVER_ERROR"
    , yes => "block_response_process" ]
  , "is_method_put":
    [ yes => "process_partial_put"
    , no => "is_method_process" ]
  , "process_partial_put":
    [ yes => "400_BAD_REQUEST"
    , no => "process_has_conflict" ]
  , "process_has_conflict":
    [ yes => "409_CONFLICT"
    , no => "process" ]
  , "is_method_process":
    [ yes => "process_has_conflict"
    , no => "500_INTERNAL_SERVER_ERROR" ]
  , "process":
    [ no => "500_INTERNAL_SERVER_ERROR"
    , yes => "block_response_process" ]

  , "block_response_create": () => "is_create_done"
  , "is_create_done":
    [ no => "202_ACCEPTED"
    , yes => "create_see_other" ]
  , "create_see_other":
    [ yes => "303_SEE_OTHER"
    , no => "201_CREATED" ]

  , "block_response_process": () => "is_process_done"
  , "is_process_done":
    [ no => "202_ACCEPTED"
    , yes => "see_other" ]

  , "block_response": () => "see_other"
  , "see_other":
    [ yes => "303_SEE_OTHER"
    , no => "has_multiple_choices" ]
  , "has_multiple_choices":
    [ yes => "300_MULTIPLE_CHOICES"
    , no => "to_content" ]
  , "to_content":
    [ no => "204_NO_CONTENT"
    , yes => "200_OK" ]

  , "100_CONTINUE": () => "has_content"
  , "200_OK": () => "end"
  , "200_OK_alternative": () => "block_response_alternative"
  , "201_CREATED": () => "end"
  , "202_ACCEPTED": () => "block_response_alternative"
  , "204_NO_CONTENT": () => "end"
  , "300_MULTIPLE_CHOICES": () => "block_response_alternative"
  , "303_SEE_OTHER": () => "end"
  , "304_NOT_MODIFIED": () => "end"
  , "307_TEMPORARY_REDIRECT": () => "end"
  , "308_PERMANENT_REDIRECT": () => "end"
  , "400_BAD_REQUEST": () => "block_response_alternative"
  , "401_UNAUTHORIZED": () => "block_response_alternative"
  , "403_FORBIDDEN": () => "block_response_alternative"
  , "404_NOT_FOUND": () => "block_response_alternative"
  , "405_METHOD_NOT_ALLOWED": () => "block_response_alternative"
  , "406_NOT_ACCEPTABLE": () => "block_response_alternative"
  , "409_CONFLICT": () => "block_response_alternative"
  , "410_GONE": () => "block_response_alternative"
  , "410_GONE": () => "block_response_alternative"
  , "412_PRECONDITION_FAILED": () => "block_response_alternative"
  , "413_PAYLOAD_TOO_LARGE": () => "block_response_alternative"
  , "414_URI_TOO_LONG": () => "block_response_alternative"
  , "415_UNSUPPORTED_MEDIA_TYPE": () => "block_response_alternative"
  , "417_EXPECTATION_FAILED": () => "block_response_alternative"
  , "431_REQUEST_HEADER_FIELDS_TOO_LARGE": () => "block_response_alternative"
  , "500_INTERNAL_SERVER_ERROR": () => "block_response_alternative"
  , "501_NOT_IMPLEMENTED": () => "block_response_alternative"
  , "503_SERVICE_UNAVAILABLE": () => "block_response_alternative"

  , "block_response_alternative": () => "is_response_alternative"
  , "is_response_alternative": 
    [ no => "end"
    , yes => "alternative_has_accept" ]
  , "alternative_has_accept": 
    [ no => "end"
    , yes => "alternative_accept_matches" ]
  , "alternative_accept_matches": 
    [ no => "end"
    , yes => "alternative_to_content" ]
  , "alternative_to_content": () => "end"
  , "end": () => {}
})

protocol.enter['is_service_available'] = () => 'yes'

protocol.enter['is_uri_too_long'] = () => 'no'
protocol.enter['are_headers_too_large'] = () => 'no'
protocol.enter['is_method_implemented'] = () => 'no'
protocol.enter['is_response_alternative'] = () => 'no'

protocol.exit['501_NOT_IMPLEMENTED'] = (req, { context }) => {
  context.res.code = 501
  context.res.message = 'Not implemented'
}

protocol.exit['503_SERVICE_UNAVAILABLE'] = (req, { context }) => {
  context.res.code = 503
  context.res.message = 'Service unavailable'
}