import { AppContext } from "@/app/AppContext";
import { Preferences } from "@/types/types";
import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useContext, useEffect, useState } from "react";
import CheckBoxTick from "../CheckBoxTick";

interface PreferencesModalProps {}

const PreferencesModal: React.FC<PreferencesModalProps> = () => {
  const { isPreferencesOpen, setIsPreferencesOpen } = useContext(AppContext);
  const [isAlwaysOnTop, setAlwaysOnTop] = useState<boolean>(false);
  const [isblurVectorScope, setblurVectorScope] = useState<boolean>(false);
  const [skinColorLine, setSkinColorLine] = useState<number>(0);

  useEffect(() => {
    const getPreferencesFromMain = async () => {
      const preferences = await window.electronAPI.loadPreferences();
      setAlwaysOnTop(preferences.alwaysOnTop);
      setblurVectorScope(preferences.blurVectorScope);
      setSkinColorLine(preferences.skinColorLine);
    };
    getPreferencesFromMain();
  }, []);

  const savePreferences = () => {
    const newPreferences: Preferences = {
      alwaysOnTop: isAlwaysOnTop,
      blurVectorScope: isblurVectorScope,
      skinColorLine: skinColorLine,
    };
    window.electronAPI.savePreferences(newPreferences);
    setIsPreferencesOpen(false);
  };

  return (
    <Dialog
      open={isPreferencesOpen}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={() => setIsPreferencesOpen(false)}
    >
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="data-[closed]:transform-[scale(95%)] max-h-[512px] w-full max-w-md flex-col rounded-xl bg-white/10 py-2 backdrop-blur-2xl duration-300 ease-out data-[closed]:opacity-0"
          >
            <DialogTitle
              as="h3"
              className="px-1 text-center text-xl font-medium text-white"
            >
              Preferences
            </DialogTitle>
            <p className="mt-2 px-1 text-center text-sm/6 text-white/75">
              Here you can select different options, that will effect the app
              behavior.
            </p>
            <form action="" className="px-5">
              <div className="mt-6 sm:col-span-4">
                <label
                  htmlFor="skincolor"
                  className="block text-sm/6 font-medium text-white"
                >
                  Skin Color Line
                </label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white px-3 outline outline-1 -outline-offset-1 outline-slate-700 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-slate-700">
                    <input
                      type="number"
                      name="skincolor"
                      id="skincolor"
                      className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 focus:outline focus:outline-0 sm:text-sm/6"
                      value={skinColorLine}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>,
                      ) => {
                        setSkinColorLine(Number(event.target.value));
                      }}
                    />
                    <div className="shrink-0 select-none text-base text-gray-500 sm:text-sm/6">
                      &deg; above red
                    </div>
                  </div>
                </div>
              </div>
              <fieldset>
                <div className="mt-6 space-y-6">
                  <div className="flex gap-3">
                    <div className="flex h-6 shrink-0 items-center">
                      <div className="group grid size-4 grid-cols-1">
                        <input
                          id="alwaysontop"
                          aria-describedby="alwaysontop-description"
                          name="alwaysontop"
                          type="checkbox"
                          checked={isAlwaysOnTop}
                          onChange={() => {
                            setAlwaysOnTop((prevState) => {
                              return !prevState;
                            });
                          }}
                          className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-slate-700 checked:bg-slate-700 indeterminate:border-slate-700 indeterminate:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                        />
                        <CheckBoxTick />
                      </div>
                    </div>
                    <div className="text-sm/6">
                      <label
                        htmlFor="alwaysontop"
                        className="font-medium text-white"
                      >
                        Always on Top
                      </label>
                      <p id="alwaysontop-description" className="text-white/75">
                        Disable if you not wish the application window to stay
                        on top of your desktop.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-6">
                  <div className="flex gap-3">
                    <div className="flex h-6 shrink-0 items-center">
                      <div className="group grid size-4 grid-cols-1">
                        <input
                          id="blurvectorscope"
                          aria-describedby="blurvectorscope-description"
                          name="blurvectorscope"
                          type="checkbox"
                          checked={isblurVectorScope}
                          onChange={() => {
                            setblurVectorScope((prevState) => {
                              return !prevState;
                            });
                          }}
                          className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-slate-700 checked:bg-slate-700 indeterminate:border-slate-700 indeterminate:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                        />
                        <CheckBoxTick />
                      </div>
                    </div>
                    <div className="text-sm/6">
                      <label
                        htmlFor="blurvectorscope"
                        className="font-medium text-white"
                      >
                        Blur Vector Scope
                      </label>
                      <p
                        id="blurvectorscope-description"
                        className="text-white/75"
                      >
                        Apply blur on the Hue-Saturation pixels.
                      </p>
                    </div>
                  </div>
                </div>
              </fieldset>
            </form>
            <div className="my-3 flex items-center justify-end px-5">
              <div
                className="cursor-pointer text-white/75 hover:underline"
                onClick={() => setIsPreferencesOpen(false)}
              >
                Cancel
              </div>
              <Button
                className="ml-2 inline-flex cursor-pointer items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-white focus:outline-none"
                onClick={savePreferences}
              >
                Save
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default PreferencesModal;
