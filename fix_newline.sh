#!/usr/bin/env bash
# remove newlines

exec $(tr -d '\n' <<< "${0} ${@}")
