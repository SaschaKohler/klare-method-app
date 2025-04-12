if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/saschakohler/.gradle/caches/8.10.2/transforms/3a020dac8f88926bf9da4884aa08cf49/transformed/hermes-android-0.76.7-debug/prefab/modules/libhermes/libs/android.x86_64/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/saschakohler/.gradle/caches/8.10.2/transforms/3a020dac8f88926bf9da4884aa08cf49/transformed/hermes-android-0.76.7-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

