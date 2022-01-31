import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import prettyBytes from "pretty-bytes";
import setupEditor from "./setupEditor";

const { requestEditor, updateResponseEditor } = setupEditor();

const form = document.querySelector("[data-form]");
const queryParamsContainer = document.querySelector("[data-query-params]");
const requestHeadersContainer = document.querySelector(
  "[data-request-headers]"
);
const keyValueTemplate = document.querySelector("[data-key-value-template]");
const responseHeadersContainer = document.querySelector(
  "[data-response-headers]"
);

queryParamsContainer.append(createKeyValuePair());
requestHeadersContainer.append(createKeyValuePair());

document
  .querySelector("[data-add-query-param-btn]")
  .addEventListener("click", (event) => {
    queryParamsContainer.append(createKeyValuePair());
  });

document
  .querySelector("[data-add-request-header-btn]")
  .addEventListener("click", (event) => {
    requestHeadersContainer.append(createKeyValuePair());
  });

function updateEndTime(response) {
  response.customData = response.customData || {};
  response.customData.time =
    new Date().getTime() - response.config.customData.startTime;

  return response;
}

function updateResponseDetails(response) {
  const dataSize = JSON.stringify(response.data).length;
  const headerSize = JSON.stringify(response.headers).length;

  document.querySelector("[data-status]").textContent = response.status;
  document.querySelector("[data-time]").textContent = response.customData.time;
  document.querySelector("[data-size]").textContent = prettyBytes(
    dataSize + headerSize
  );
}

function updateResponseHeaders(headers) {
  responseHeadersContainer.innerHTML = "";
  Object.entries(headers).forEach(([key, value]) => {
    const keyElement = document.createElement("div");
    keyElement.textContent = key;
    responseHeadersContainer.append(keyElement);

    const valueElement = document.createElement("div");
    valueElement.textContent = value;
    responseHeadersContainer.append(valueElement);
  });
}

function createKeyValuePair() {
  const element = keyValueTemplate.content.cloneNode(true);

  element
    .querySelector("[data-remove-btn]")
    .addEventListener("click", (event) => {
      event.target.closest("[data-key-value-pair]").remove();
    });

  return element;
}

function keyValuePairToObjects(container) {
  const pairs = container.querySelectorAll("[data-key-value-pair]");

  return [...pairs].reduce((data, pair) => {
    const key = pair.querySelector("[data-key]").value;
    const value = pair.querySelector("[data-value]").value;

    if (key === "") {
      return data;
    }

    return {
      ...data,
      [key]: value,
    };
  }, {});
}

function createRequest(data) {
  const request = axios.create({
    baseURL: document.querySelector("[data-url]").value,
    method: document.querySelector("[data-method]").value,
    params: keyValuePairToObjects(queryParamsContainer),
    headers: keyValuePairToObjects(requestHeadersContainer),
    data,
  });

  request.interceptors.request.use((request) => {
    request.customData = request.customData || {};
    request.customData.startTime = new Date().getTime();
    return request;
  });

  request.interceptors.response.use(updateEndTime, (error) => {
    return Promise.reject(updateEndTime(error.response));
  });

  return request;
}

function sendRequest(request) {
  request()
    .catch((error) => error)
    .then((response) => {
      document
        .querySelector("[data-response-section]")
        .classList.remove("d-none");
      updateResponseDetails(response);
      updateResponseEditor(response.data);
      updateResponseHeaders(response.headers);
    });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  let data;

  try {
    data = JSON.parse(requestEditor.state.doc.toString() || null);
  } catch (error) {
    alert("JSON data is malformed");
    return;
  }

  const request = createRequest(data);

  sendRequest(request)
});

window.addEventListener("load", () => {
  document.querySelector("body").removeAttribute("hidden");
});
