# Machine Learning Gmodstore Ticket Classifier Dataset Builder
Build a Machine Learning Classification dataset for your Gmodstore tickets, using the Gmodstore Tag system.

## What actually is this?
The script used the Gmodstore API to pull all the given tickets for a provided product, and breaks their opening message up into a folder structure based on the ticket's labels.
It follows the structure required by [liner.ai](https://liner.ai/)'s classification model, which is what this script was made to satisfy. But there's no reason you couldn't import this data to another tool/package.

## What can I do with this?
If you use [liner.ai](https://liner.ai/), you can export your model as a [TensorFlow](https://www.tensorflow.org/). You can then use your model in something like NodeJS to automatically classify new Gmodstore Tickets and provide automated responses,
which is the reason this even exists.


## How do I use this?
1. Clone this repo.
2. run ``npm install``.
3. Copy the ``.env.copy`` to ``.env``.
4. Fill in the 2 values for the ``.env``.
5. Run ``npm run start``.
6. Allow the script to pull down the data from the API and format it.
7. You should now find a labelled data set in ``/data``

## What if I don't use tags?
Any untagged tickets will be placed in a ``/unlabelled`` label. You are then free to label those yourself. It is not suggested to include the ``unlabelled`` label set in your training data, as it can warp your results. I suggest labelling your tickets
on GmodStore directly, because if you need to pull the data down again at a later date, you will not need to manually relabel it all.

## Credits
- [Creekie](https://github.com/Creekie1337) - Helping me understand things and being an emotional support robot.
