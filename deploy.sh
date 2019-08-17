#!/bin/bash
gcloud functions deploy proxysigner-coinbase --source=.
gcloud functions deploy proxysigner-kraken --source=.